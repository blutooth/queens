<script>
  import { asset } from './asset.js';

  // Serverless checkout (Cloudflare Worker) that locks in the quantity so the
  // guest never has to type it. Set this to your deployed Worker URL — until
  // then the button falls back to the plain Payment Link (manual quantity).
  // See cloudflare/glamping-checkout/README.md.
  const CHECKOUT_ENDPOINT = 'https://glamping-checkout.africanqueens.workers.dev';

  // Fallback Payment Link — £30 per unit, guest adjusts quantity themselves.
  const STRIPE = 'https://checkout.africanqueenssummit.com/b/00w9AT5Db1fy5tngvT1VK04';
  const RATE = 30;

  $: autoCheckout = !!CHECKOUT_ENDPOINT;
  $: checkoutUrl = autoCheckout
    ? `${CHECKOUT_ENDPOINT}?qty=${personNights}&nights=${nights}&guests=${guests}&from=${arrival}&to=${departure}`
    : STRIPE;

  // The summit runs 14–31 August 2026. Arrival can be any night 14–30 Aug;
  // departure the morning after the last night, 15–31 Aug.
  const MONTH = 'August 2026';
  const arrivalDays = Array.from({ length: 17 }, (_, i) => 14 + i); // 14..30
  const departDaysAll = Array.from({ length: 17 }, (_, i) => 15 + i); // 15..31

  let arrival = 14;
  let departure = 17;
  let guests = 1;

  // Keep departure strictly after arrival.
  $: departDays = departDaysAll.filter((d) => d > arrival);
  $: if (departure <= arrival) departure = arrival + 1;

  $: nights = Math.max(0, departure - arrival);
  $: personNights = nights * guests;
  $: total = personNights * RATE;

  const ord = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const gallery = [
    { src: asset('/images/hawkhill-grounds.png'), cap: 'The walled grounds of Hawkhill Place — your setting for the Summit.' },
    { src: asset('/images/glamping-6.jpg'), cap: 'Inside a furnished bell tent — a proper bed beneath the canvas.' },
    { src: asset('/images/glamping-1.jpg'), cap: 'Cream canvas bell tents on their own timber decks.' },
    { src: asset('/images/glamping-2.jpg'), cap: 'Lantern-lit under an Oxfordshire moon.' },
    { src: asset('/images/glamping-5.jpg'), cap: 'Soft furnishings and light through the canopy.' },
  ];
</script>

<section class="glamp">
  <!-- Hero -->
  <header class="hero" style="background-image: linear-gradient(to bottom, rgba(20,26,20,0.35), rgba(20,26,20,0.75)), url({asset('/images/glamping-3.jpg')})">
    <div class="hero-inner">
      <p class="eyebrow">Hawkhill Place · Oxfordshire</p>
      <h1>Glamping<br /><span class="italic">under summer skies.</span></h1>
      <p class="lede">
        Stay in a luxury bell tent in the private grounds of Hawkhill Place for
        the nights of the Summit — canvas and comfort, minutes from the
        gathering. <strong>£30 per person, per night.</strong>
      </p>
      <a class="scroll" href="#book">Book your nights ↓</a>
    </div>
  </header>

  <!-- Intro -->
  <div class="container intro">
    <p class="eyebrow center">The residence, in canvas</p>
    <h2>A gentler way to stay close.</h2>
    <p class="sub">
      Furnished bell tents on private timber decks in the walled grounds of
      Hawkhill Place — real beds, soft linens and lantern light, with the
      Summit's residential home and gardens just steps away. Reserve any nights
      between the <strong>14th and 31st of August 2026</strong>.
    </p>
  </div>

  <!-- Gallery -->
  <div class="gallery">
    {#each gallery as g}
      <figure>
        <img src={g.src} alt={g.cap} loading="lazy" />
        <figcaption>{g.cap}</figcaption>
      </figure>
    {/each}
  </div>

  <!-- Booking -->
  <div class="container">
    <div class="book" id="book">
      <div class="book-head">
        <p class="eyebrow center">Reserve your stay</p>
        <h2>Choose your nights.</h2>
        <p class="sub">
          Pick your arrival and departure and the number of guests. You'll pay
          <strong>£{RATE} per person per night</strong> securely by card.
        </p>
      </div>

      <div class="panel">
        <div class="fields">
          <label>
            <span>Arrival</span>
            <select bind:value={arrival}>
              {#each arrivalDays as d}
                <option value={d}>{ord(d)} {MONTH}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Departure</span>
            <select bind:value={departure}>
              {#each departDays as d}
                <option value={d}>{ord(d)} {MONTH}</option>
              {/each}
            </select>
          </label>

          <div class="stepper">
            <span>Guests</span>
            <div class="step-row">
              <button type="button" on:click={() => (guests = Math.max(1, guests - 1))} aria-label="Fewer guests">–</button>
              <strong>{guests}</strong>
              <button type="button" on:click={() => (guests = guests + 1)} aria-label="More guests">+</button>
            </div>
          </div>
        </div>

        <div class="summary">
          <div class="line"><span>{nights} {nights === 1 ? 'night' : 'nights'} × {guests} {guests === 1 ? 'guest' : 'guests'}</span><span>{personNights} × £{RATE}</span></div>
          <div class="total"><span>Total</span><strong>£{total}</strong></div>
          <a class="cta" class:disabled={nights < 1} href={nights < 1 ? undefined : checkoutUrl} target="_blank" rel="noopener">
            Book &amp; pay £{total} →
          </a>
          {#if autoCheckout}
            <p class="note">
              Secure card payment via Stripe — your {personNights}
              {personNights === 1 ? 'night' : 'nights'} ({guests} × {nights}) are
              already totalled. Nothing to type.
            </p>
          {:else}
            <p class="note">
              On the secure checkout, set the <strong>quantity to {personNights}</strong>
              — one for each guest, each night ({guests} × {nights}). Each unit is £{RATE}.
            </p>
          {/if}
        </div>
      </div>

      <p class="footnote">
        Bookings are confirmed on receipt of payment. For groups, extended stays
        or special requirements, contact the Office of the Convener.
      </p>
    </div>
  </div>
</section>

<style>
  .glamp { background: var(--paper); color: var(--ink); }

  /* Hero */
  .hero {
    min-height: 78vh;
    display: flex;
    align-items: flex-end;
    background-size: cover;
    background-position: center;
    color: var(--cream);
    padding: clamp(2rem, 6vw, 5rem);
  }
  .hero-inner { max-width: 720px; }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--gold-bright);
    margin-bottom: 1rem;
  }
  .eyebrow.center { text-align: center; }
  .hero h1 {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(2.6rem, 8vw, 5rem);
    line-height: 1.02;
    letter-spacing: -0.01em;
    color: #ffffff;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.4);
  }
  .hero .italic { font-style: italic; color: #ffffff; }
  .lede { margin: 1.4rem 0 1.8rem; font-size: clamp(1rem, 2.2vw, 1.22rem); color: rgba(250,246,234,0.9); max-width: 40ch; }
  .lede strong { color: var(--cream); }
  .scroll {
    display: inline-block;
    color: var(--cream);
    text-decoration: none;
    border-bottom: 1px solid var(--gold-bright);
    padding-bottom: 3px;
    font-weight: 500;
  }

  .container { max-width: 1080px; margin: 0 auto; padding: 0 clamp(1.2rem, 4vw, 2.5rem); }

  /* Intro */
  .intro { text-align: center; padding-top: clamp(3rem, 7vw, 5.5rem); }
  .intro h2, .book-head h2 {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.9rem, 5vw, 3rem);
    color: var(--forest);
  }
  .sub { color: var(--ink-soft); max-width: 58ch; margin: 1rem auto 0; font-size: 1.05rem; }

  /* Gallery */
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
    max-width: 1200px;
    margin: clamp(2.5rem, 6vw, 4rem) auto;
    padding: 0 clamp(1.2rem, 4vw, 2.5rem);
  }
  .gallery figure { margin: 0; position: relative; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(35,28,21,0.16); }
  .gallery img { width: 100%; height: 320px; object-fit: cover; display: block; transition: transform 0.6s ease; }
  .gallery figure:hover img { transform: scale(1.05); }
  .gallery figcaption {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 2rem 1rem 0.9rem;
    background: linear-gradient(to top, rgba(20,26,20,0.82), transparent);
    color: var(--cream); font-size: 0.82rem; line-height: 1.4;
  }

  /* Booking */
  .book {
    background: var(--paper-soft);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: clamp(1.6rem, 4vw, 3rem);
    margin: 0 auto clamp(3rem, 7vw, 5rem);
  }
  .book-head { text-align: center; margin-bottom: 2rem; }
  .panel {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: clamp(1.2rem, 3vw, 2.4rem);
    align-items: stretch;
  }
  @media (max-width: 720px) { .panel { grid-template-columns: 1fr; } }

  .fields { display: flex; flex-direction: column; gap: 1.1rem; justify-content: center; }
  .fields label, .stepper { display: flex; flex-direction: column; gap: 0.45rem; }
  .fields span, .stepper > span {
    text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.7rem;
    font-weight: 600; color: var(--muted);
  }
  select {
    font-family: var(--font-sans); font-size: 1.05rem; color: var(--ink);
    background: var(--cream); border: 1px solid var(--line-strong);
    border-radius: 10px; padding: 0.7rem 0.9rem; width: 100%; cursor: pointer;
  }
  .step-row { display: flex; align-items: center; gap: 1rem; }
  .step-row button {
    width: 44px; height: 44px; border-radius: 50%; cursor: pointer;
    border: 1px solid var(--line-strong); background: var(--cream);
    font-size: 1.4rem; line-height: 1; color: var(--forest);
    display: flex; align-items: center; justify-content: center;
  }
  .step-row button:hover { background: var(--forest); color: var(--cream); border-color: var(--forest); }
  .step-row strong { font-family: var(--font-display); font-size: 1.6rem; min-width: 1.5ch; text-align: center; }

  .summary {
    background: var(--forest); color: var(--cream);
    border-radius: 14px; padding: clamp(1.4rem, 3vw, 2rem);
    display: flex; flex-direction: column; justify-content: center;
  }
  .summary .line {
    display: flex; justify-content: space-between; gap: 1rem;
    font-size: 0.95rem; color: rgba(250,246,234,0.82);
    padding-bottom: 0.9rem; border-bottom: 1px solid rgba(250,246,234,0.18);
  }
  .summary .total {
    display: flex; justify-content: space-between; align-items: baseline;
    margin: 0.9rem 0 1.3rem;
  }
  .summary .total span { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.78rem; color: rgba(250,246,234,0.7); }
  .summary .total strong { font-family: var(--font-display); font-weight: 400; font-size: clamp(2rem, 6vw, 2.8rem); color: var(--gold-bright); }

  .cta {
    display: block; text-align: center; text-decoration: none;
    background: var(--terracotta-bright); color: var(--ink);
    font-weight: 600; padding: 0.95rem 1.2rem; border-radius: 999px;
    transition: background 0.2s ease;
  }
  .cta:hover { background: var(--terracotta-soft); }
  .cta.disabled { background: rgba(250,246,234,0.25); color: rgba(250,246,234,0.6); pointer-events: none; }
  .note { font-size: 0.8rem; color: rgba(250,246,234,0.78); margin-top: 0.9rem; line-height: 1.5; }
  .note strong { color: var(--cream); }

  .footnote { text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1.8rem; }
</style>
