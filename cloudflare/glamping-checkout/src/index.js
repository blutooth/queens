// Cloudflare Worker — creates a Stripe Checkout Session and redirects the
// visitor to Stripe. Handles TWO flows with ONE Stripe secret:
//
//   • Glamping  — ?qty=<person-nights>   → charges qty × RATE_PENCE
//   • Donation  — ?intent=donate&amount= → charges a freely-chosen amount
//                 (one-time or monthly), GBP/USD/EUR
//
// Why this exists: Stripe Payment Links have a FIXED price, so they can't take
// a quantity or a chosen donation amount from the page. Setting the amount
// server-side needs the SECRET key — which must never live in the static site.
// This Worker holds the secret and makes that one API call.
//
// Secret required (set once with `wrangler secret put STRIPE_SECRET_KEY`):
//   STRIPE_SECRET_KEY  — sk_test_… (or sk_live_… when live)
//
// Optional vars (wrangler.toml [vars]):
//   RATE_PENCE — glamping price per person per night, in pence (default 3000)
//   SITE_URL   — your site origin (default https://africanqueenssummit.com)

const DEFAULT_RATE_PENCE = 3000;
const DEFAULT_SITE = 'https://africanqueenssummit.com';
const MAX_QTY = 600; // safety cap (≈ 17 nights × 35 guests)

const MIN_MINOR = 100; //      £1     — donation floor
const MAX_MINOR = 5_000_000; // £50,000 — donation cap
const CURRENCIES = new Set(['gbp', 'usd', 'eur']);

function ord(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const site = (env.SITE_URL || DEFAULT_SITE).replace(/\/$/, '');

    if (!env.STRIPE_SECRET_KEY) {
      return new Response('Checkout is not configured.', { status: 500 });
    }

    // Route: donation if explicitly asked, or if a donation amount is present.
    const isDonation =
      url.pathname.includes('donate') ||
      url.searchParams.get('intent') === 'donate' ||
      url.searchParams.has('amount');

    return isDonation ? donate(url, env, site) : glamping(url, env, site);
  },
};

// ---- Donation: a freely-chosen amount, one-time or monthly ----------------
async function donate(url, env, site) {
  const back = `${site}/donate/`;

  const amount = parseInt(url.searchParams.get('amount'), 10);
  if (!Number.isInteger(amount) || amount < MIN_MINOR || amount > MAX_MINOR) {
    return redirect(`${back}?error=amount`);
  }

  let currency = (url.searchParams.get('currency') || 'gbp').toLowerCase();
  if (!CURRENCIES.has(currency)) currency = 'gbp';

  const monthly = url.searchParams.get('mode') === 'subscription';
  const designation = clip(url.searchParams.get('designation'), 200) || 'Where it is needed most';
  const giftaid = url.searchParams.get('giftaid') === '1';

  const productName = monthly
    ? 'Monthly gift · African Queens Summit'
    : 'Gift · African Queens Summit';

  const form = new URLSearchParams();
  form.set('mode', monthly ? 'subscription' : 'payment');
  form.set('success_url', `${back}?thanks=1`);
  form.set('cancel_url', back);
  form.set('submit_type', monthly ? 'auto' : 'donate');
  form.set('line_items[0][quantity]', '1');
  form.set('line_items[0][price_data][currency]', currency);
  form.set('line_items[0][price_data][unit_amount]', String(amount));
  form.set('line_items[0][price_data][product_data][name]', productName);
  form.set('line_items[0][price_data][product_data][description]', `Directed to: ${designation}`);
  if (monthly) form.set('line_items[0][price_data][recurring][interval]', 'month');
  form.set('metadata[designation]', designation);
  form.set('metadata[gift_aid]', giftaid ? 'yes' : 'no');
  if (monthly) form.set('subscription_data[metadata][designation]', designation);

  return createSession(form, env, back);
}

// ---- Glamping: quantity × nightly rate ------------------------------------
async function glamping(url, env, site) {
  const ratePence = parseInt(env.RATE_PENCE, 10) || DEFAULT_RATE_PENCE;

  const qty = parseInt(url.searchParams.get('qty'), 10);
  const nights = parseInt(url.searchParams.get('nights'), 10) || null;
  const guests = parseInt(url.searchParams.get('guests'), 10) || null;
  const from = parseInt(url.searchParams.get('from'), 10) || null;
  const to = parseInt(url.searchParams.get('to'), 10) || null;

  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    return redirect(`${site}/glamping/?error=quantity`);
  }

  let desc = 'Glamping at Hawkhill Place — per person, per night';
  if (nights && guests) {
    const range = from && to ? ` (${ord(from)}–${ord(to)} Aug: ${guests} × ${nights} nights)` : '';
    desc = `Glamping at Hawkhill Place${range}`;
  }

  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('success_url', `${site}/glamping/?booked=1`);
  form.set('cancel_url', `${site}/glamping/`);
  form.set('line_items[0][quantity]', String(qty));
  form.set('line_items[0][price_data][currency]', 'gbp');
  form.set('line_items[0][price_data][unit_amount]', String(ratePence));
  form.set('line_items[0][price_data][product_data][name]', 'Glamping — per person, per night');
  form.set('line_items[0][price_data][product_data][description]', desc);
  form.set('line_items[0][adjustable_quantity][enabled]', 'true');
  form.set('line_items[0][adjustable_quantity][minimum]', '1');
  form.set('line_items[0][adjustable_quantity][maximum]', String(MAX_QTY));
  if (nights) form.set('metadata[nights]', String(nights));
  if (guests) form.set('metadata[guests]', String(guests));
  if (from && to) form.set('metadata[stay]', `${ord(from)}-${ord(to)} Aug 2026`);

  return createSession(form, env, `${site}/glamping/`);
}

// ---- Shared: create the Stripe session and redirect -----------------------
async function createSession(form, env, backOnError) {
  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  const session = await resp.json();
  if (!resp.ok || !session.url) {
    return new Response(
      `Could not start checkout: ${session.error?.message || 'unknown error'}`,
      { status: 502 },
    );
  }
  return redirect(session.url);
}

function clip(v, n) {
  return v ? String(v).slice(0, n).trim() : '';
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { Location: location, 'Cache-Control': 'no-store' },
  });
}
