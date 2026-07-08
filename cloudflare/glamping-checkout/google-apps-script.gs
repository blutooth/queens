/**
 * Glamping checkout — Google Apps Script web app (no new account needed;
 * uses your existing Google account).
 *
 * It creates a Stripe Checkout Session with the quantity (person-nights)
 * locked in, then sends the guest to Stripe. The Stripe SECRET key lives in
 * Script Properties, never in the website.
 *
 * ── SETUP (one time, ~3 min) ─────────────────────────────────────────────
 * 1. Go to https://script.google.com  →  New project.
 * 2. Delete the sample code, paste ALL of this file, Save.
 * 3. Project Settings (gear) → Script properties → Add:
 *       STRIPE_SECRET_KEY = sk_test_…   (use test key first; sk_live_… later)
 *    Optional:
 *       RATE_PENCE = 3000               (£30; default if omitted)
 *       SITE_URL   = https://africanqueenssummit.com
 * 4. Deploy → New deployment → type "Web app".
 *       Execute as: Me
 *       Who has access: Anyone
 *    Deploy, authorise, and copy the Web app URL
 *    (https://script.google.com/macros/s/……/exec).
 * 5. Put that URL into src/lib/Glamping.svelte:
 *       const CHECKOUT_ENDPOINT = 'https://script.google.com/macros/s/……/exec';
 *    Rebuild / redeploy the site.
 *
 * Called as: <URL>?qty=6&nights=3&guests=2&from=14&to=17
 * ─────────────────────────────────────────────────────────────────────────
 */

var DEFAULT_RATE_PENCE = 3000;
var DEFAULT_SITE = 'https://africanqueenssummit.com';
var MAX_QTY = 600;

function doGet(e) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('STRIPE_SECRET_KEY');
  var ratePence = parseInt(props.getProperty('RATE_PENCE'), 10) || DEFAULT_RATE_PENCE;
  var site = (props.getProperty('SITE_URL') || DEFAULT_SITE).replace(/\/$/, '');

  var p = (e && e.parameter) || {};
  var qty = parseInt(p.qty, 10);
  var nights = parseInt(p.nights, 10) || null;
  var guests = parseInt(p.guests, 10) || null;
  var from = parseInt(p.from, 10) || null;
  var to = parseInt(p.to, 10) || null;

  if (!secret) return html_('Checkout is not configured (missing STRIPE_SECRET_KEY).');
  if (!(qty >= 1 && qty <= MAX_QTY)) return redirect_(site + '/glamping/?error=quantity');

  var stay = (from && to) ? (ord_(from) + '-' + ord_(to) + ' Aug 2026') : '';
  var desc = 'Glamping at Hawkhill Place' +
    (nights && guests ? ' (' + guests + ' × ' + nights + ' nights' + (stay ? ', ' + stay : '') + ')' : '');

  var payload = {
    'mode': 'payment',
    'success_url': site + '/glamping/?booked=1',
    'cancel_url': site + '/glamping/',
    'line_items[0][quantity]': String(qty),
    'line_items[0][price_data][currency]': 'gbp',
    'line_items[0][price_data][unit_amount]': String(ratePence),
    'line_items[0][price_data][product_data][name]': 'Glamping — per person, per night',
    'line_items[0][price_data][product_data][description]': desc,
    'line_items[0][adjustable_quantity][enabled]': 'true',
    'line_items[0][adjustable_quantity][minimum]': '1',
    'line_items[0][adjustable_quantity][maximum]': String(MAX_QTY)
  };
  if (nights) payload['metadata[nights]'] = String(nights);
  if (guests) payload['metadata[guests]'] = String(guests);
  if (stay) payload['metadata[stay]'] = stay;

  var resp = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + secret },
    payload: payload,
    muteHttpExceptions: true
  });

  var session = JSON.parse(resp.getContentText() || '{}');
  if (resp.getResponseCode() >= 300 || !session.url) {
    return html_('Could not start checkout: ' + ((session.error && session.error.message) || 'unknown error'));
  }
  return redirect_(session.url);
}

// Apps Script can't send a raw 302, so bounce the top window to the URL.
function redirect_(url) {
  var safe = String(url).replace(/"/g, '&quot;');
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta http-equiv="refresh" content="0;url=' + safe + '">' +
    '<script>window.top.location.replace(' + JSON.stringify(url) + ');<\/script>' +
    '<p style="font-family:sans-serif">Redirecting to secure checkout…</p>'
  ).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function html_(msg) {
  return HtmlService.createHtmlOutput('<p style="font-family:sans-serif">' + msg + '</p>');
}

function ord_(n) {
  var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
