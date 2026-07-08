// Cloudflare Worker — creates a Stripe Checkout Session for glamping with the
// quantity (person-nights) locked in, then redirects the guest to Stripe.
//
// Why this exists: Stripe Payment Links can't take a quantity via the URL, and
// setting quantity server-side (line_items[0][quantity]) needs the SECRET key —
// which must never live in the static site. This Worker holds the secret and
// does that call. See README.md for deploy steps.
//
// Secret required (set with `wrangler secret put STRIPE_SECRET_KEY`):
//   STRIPE_SECRET_KEY  — sk_test_… (or sk_live_… when you go live)
//
// Optional vars (wrangler.toml [vars]):
//   RATE_PENCE   — price per person per night, in pence (default 3000 = £30)
//   SITE_URL     — your site origin (default https://africanqueenssummit.com)

const DEFAULT_RATE_PENCE = 3000;
const DEFAULT_SITE = 'https://africanqueenssummit.com';
const MAX_QTY = 600; // safety cap (≈ 17 nights × 35 guests)

function ord(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const ratePence = parseInt(env.RATE_PENCE, 10) || DEFAULT_RATE_PENCE;
    const site = (env.SITE_URL || DEFAULT_SITE).replace(/\/$/, '');

    // person-nights (the quantity). Also accept context for the receipt.
    const qty = parseInt(url.searchParams.get('qty'), 10);
    const nights = parseInt(url.searchParams.get('nights'), 10) || null;
    const guests = parseInt(url.searchParams.get('guests'), 10) || null;
    const from = parseInt(url.searchParams.get('from'), 10) || null;
    const to = parseInt(url.searchParams.get('to'), 10) || null;

    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return redirect(`${site}/glamping/?error=quantity`);
    }

    if (!env.STRIPE_SECRET_KEY) {
      return new Response('Checkout is not configured.', { status: 500 });
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
    // Let the guest still fine-tune the count on Stripe if they wish.
    form.set('line_items[0][adjustable_quantity][enabled]', 'true');
    form.set('line_items[0][adjustable_quantity][minimum]', '1');
    form.set('line_items[0][adjustable_quantity][maximum]', String(MAX_QTY));
    if (nights) form.set('metadata[nights]', String(nights));
    if (guests) form.set('metadata[guests]', String(guests));
    if (from && to) form.set('metadata[stay]', `${ord(from)}-${ord(to)} Aug 2026`);

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
  },
};

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { Location: location, 'Cache-Control': 'no-store' },
  });
}
