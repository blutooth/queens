# Checkout Worker (glamping + donations)

A tiny Cloudflare Worker that creates a Stripe Checkout Session and redirects
the visitor to Stripe. It handles **two flows with one Stripe secret key**:

- **Glamping** — `?qty=6&nights=3&guests=2&from=14&to=17` → charges qty × £30.
- **Donations** — `?intent=donate&amount=25000&currency=gbp&mode=payment` →
  charges a freely-chosen amount (`amount` in pence), one-time or `mode=subscription`
  for monthly. Optional `designation`, `giftaid=1`.

Neither page can set the price itself: Stripe Payment Links have a fixed price,
and setting the amount server-side needs the **secret key**, which must never
live in a static site. This Worker holds the secret and makes that one API call.

> The donate page (`src/lib/Donate.svelte`) points at this same Worker URL — so
> once it's deployed with the secret set, **both** glamping and giving work.
> There is no separate donations worker to deploy.

## Deploy (one time)

> **Node note:** wrangler 4+ needs Node 22. On Node 20 use `npx wrangler@3`
> (shown below) — no global install, no sudo.

1. Log in (opens your browser):
   ```
   cd cloudflare/glamping-checkout
   npx wrangler@3 login
   ```

2. Set your Stripe secret key (use the **test** key first):
   ```
   npx wrangler@3 secret put STRIPE_SECRET_KEY
   # paste sk_test_…  (later: sk_live_… when you go live)
   ```

3. Deploy:
   ```
   npx wrangler@3 deploy
   ```
   Wrangler prints the Worker URL, e.g.
   `https://glamping-checkout.<your-subdomain>.workers.dev`

4. Put that URL into the glamping page:
   open `src/lib/Glamping.svelte` and set
   ```js
   const CHECKOUT_ENDPOINT = 'https://glamping-checkout.<your-subdomain>.workers.dev';
   ```
   Rebuild / redeploy the site. Until this is set, the button falls back to the
   plain Payment Link (guest sets quantity manually).

## Going live

- Re-run `wrangler secret put STRIPE_SECRET_KEY` with your `sk_live_…` key.
- Confirm `SITE_URL` in `wrangler.toml` is correct, then `wrangler deploy`.

## Notes

- `RATE_PENCE` (in `wrangler.toml`) controls the price — 3000 = £30.
- The session enables `adjustable_quantity`, so a guest can still tweak the
  count on Stripe if they need to.
- No customer data is stored by the Worker; it only forwards to Stripe.
