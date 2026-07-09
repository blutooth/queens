<script>
  // Serverless checkout — the SAME Cloudflare Worker as glamping (it already
  // holds the Stripe secret). ?intent=donate routes it to the donation flow.
  // Deploy: cloudflare/glamping-checkout/README.md
  const CHECKOUT_ENDPOINT = 'https://glamping-checkout.africanqueens.workers.dev';

  const CONTACT = 'africanqueenssummit@gmail.com';

  const currencies = [
    { code: 'GBP', sym: '£' },
    { code: 'USD', sym: '$' },
    { code: 'EUR', sym: '€' },
  ];
  let currency = 'GBP';
  $: sym = currencies.find((c) => c.code === currency)?.sym ?? '£';

  let frequency = 'one-time'; // 'one-time' | 'monthly'

  const presets = [50, 100, 250, 500, 1000];
  let amount = 250; // the chosen amount (number)
  let custom = ''; // free-typed "Other" value
  let usingCustom = false;

  function choosePreset(v) {
    amount = v;
    usingCustom = false;
    custom = '';
  }
  function onCustom(e) {
    usingCustom = true;
    custom = e.target.value.replace(/[^0-9.]/g, '');
    const n = parseFloat(custom);
    amount = Number.isFinite(n) ? n : 0;
  }

  const designations = [
    { value: 'Where it is needed most', label: 'Where it is needed most' },
    { value: 'Seat a Queen', label: 'Seat a Queen — travel & stay' },
    { value: 'Amplify the Summit', label: 'Amplify the Summit — record & broadcast' },
    { value: 'Sustain the Movement', label: 'Sustain the Movement — beyond England' },
  ];
  let designation = 'Where it is needed most';

  let giftAid = false;

  // The amount buttons in the widget imply a helper line.
  const helperFor = (v) => {
    if (v >= 1000) return 'Underwrites a full delegate — travel, stay and protocol.';
    if (v >= 500) return 'Brings a royal house that could not otherwise make the journey.';
    if (v >= 250) return "Supports a delegate's transport and protocol in London.";
    if (v >= 100) return 'Covers ground transport across the summit for a delegate.';
    if (v >= 50) return 'Joins the fund that seats a queen for the convocation.';
    return 'Every gift joins the fund that seats a queen for the summit.';
  };
  $: helper = helperFor(amount);

  // Build the checkout URL for any amount (in the selected currency / frequency).
  function checkoutUrl(value, { designation: d = designation, mode } = {}) {
    const p = new URLSearchParams();
    p.set('intent', 'donate');
    p.set('amount', String(Math.round(value * 100)));
    p.set('currency', currency.toLowerCase());
    p.set('mode', (mode ?? frequency) === 'monthly' ? 'subscription' : 'payment');
    if (d) p.set('designation', d);
    if (giftAid) p.set('giftaid', '1');
    return `${CHECKOUT_ENDPOINT}?${p.toString()}`;
  }

  $: valid = amount >= 1;

  function give() {
    if (!valid) return;
    window.location.href = checkoutUrl(amount);
  }

  // A fixed-amount give (seat tiers, sponsor circles) — always one-time.
  function giveFixed(value, designationLabel) {
    window.location.href = checkoutUrl(value, { designation: designationLabel, mode: 'one-time' });
  }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const ways = [
    {
      no: 'No. 01',
      title: 'Seat a Queen',
      body:
        'Travel, accommodation, and protocol support, so that queens and princesses of modest means take their rightful place at the convocation.',
      points: ['Flights and ground transport', 'Accommodation across the summit', 'Protocol and delegate support'],
    },
    {
      no: 'No. 02',
      title: 'Amplify the Summit',
      body:
        'Documentation, broadcast, and the printed record that carry the Queen Aruk Declaration and the proceedings well beyond the room.',
      points: ['Filming and photography', 'The summit programme and record', 'Reach across the Diaspora'],
    },
    {
      no: 'No. 03',
      title: 'Sustain the Movement',
      body:
        'The work that outlives England, as the convocation continues across the Caribbean and the nations of Africa for years to come.',
      points: ['Follow-through convenings', 'The next generation of royal leadership', 'A lasting archive of the lineage'],
    },
  ];

  const sponsorTiers = [
    {
      no: 'No. 01',
      name: 'Sceptre',
      role: 'Supporter',
      amount: 2500,
      points: ["Name on the summit's digital donor wall", 'Acknowledgement in the summit programme', 'Seats travel support toward one delegate', 'A post-summit impact report'],
    },
    {
      no: 'No. 02',
      name: 'Diadem',
      role: 'Patron',
      amount: 5000,
      points: ['Everything in Sceptre, and', 'Logo on the summit sponsors page', 'Two invitations to a summit reception', 'Seats one delegate for travel and stay', 'Recognition across summit social channels'],
    },
    {
      no: 'No. 03',
      name: 'Throne',
      role: 'Benefactor',
      amount: 10000,
      points: ['Everything in Diadem, and', 'Logo in the printed programme and on-screen at the Royal Gala', 'Two seats at the Royal Gala Night, Porchester Hall', 'Seats two delegates', 'Named acknowledgement at the Oxford convocation'],
    },
    {
      no: 'No. 04',
      name: 'Crown',
      role: 'Presenting Patron',
      amount: 25000,
      presenting: true,
      points: ['Everything in Throne, and', 'Presenting recognition across summit branding', 'A table of eight at the Royal Gala, with Royal High Tea invitations', 'Seats four delegates', 'A greeting or branded moment, subject to protocol', 'Featured in the post-summit record'],
    },
  ];

  // Sponsor enquiry — no backend on a static site, so compose an email.
  let org = '', contactName = '', enqEmail = '', enqPhone = '', interest = 'Sceptre · Supporter', message = '';
  function sendEnquiry() {
    const body = [
      `Organisation: ${org}`,
      `Contact: ${contactName}`,
      `Email: ${enqEmail}`,
      `Phone: ${enqPhone}`,
      `Interested in: ${interest}`,
      '',
      message,
    ].join('\n');
    const subject = encodeURIComponent(`Sponsorship enquiry — ${interest}`);
    window.location.href = `mailto:${CONTACT}?subject=${subject}&body=${encodeURIComponent(body)}`;
  }
</script>

<div class="give">
  <!-- ============ HERO + GIVE ============ -->
  <header class="hero" id="give">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow gold">Support the Convocation · 14–31 August 2026</p>
        <h1>A seat for every<br /><span class="accent">crown.</span></h1>
        <p class="lede">
          One hundred queens of Africa and the Diaspora are called to England.
          Not every royal house can meet the cost of the journey. Your gift seats
          a queen at the convocation and carries the movement onward to the
          Caribbean and the nations of Africa.
        </p>
        <ul class="trust">
          <li>Secure card payment via Stripe</li>
          <li>Gift Aid for UK taxpayers</li>
          <li>Welcomed from anywhere in the world</li>
        </ul>
        <button class="link-ghost" on:click={() => scrollTo('sponsor')}>Or become a sponsor →</button>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Make a gift</h3>
          <div class="seg small">
            {#each currencies as c}
              <button class:on={currency === c.code} on:click={() => (currency = c.code)}>{c.code}</button>
            {/each}
          </div>
        </div>

        <div class="seg wide">
          <button class:on={frequency === 'one-time'} on:click={() => (frequency = 'one-time')}>One-time</button>
          <button class:on={frequency === 'monthly'} on:click={() => (frequency = 'monthly')}>Monthly</button>
        </div>

        <p class="field-label">Choose an amount</p>
        <div class="amounts">
          {#each presets as v}
            <button class="amt" class:on={!usingCustom && amount === v} on:click={() => choosePreset(v)}>{sym}{v.toLocaleString()}</button>
          {/each}
          <div class="amt other" class:on={usingCustom}>
            <span>{sym}</span>
            <input inputmode="decimal" placeholder="Other" value={custom} on:input={onCustom} aria-label="Other amount" />
          </div>
        </div>

        <p class="helper">♛ {helper}{frequency === 'monthly' ? ' · billed monthly' : ''}</p>

        <label class="stack">
          <span class="field-label">Direct my gift to</span>
          <select bind:value={designation}>
            {#each designations as d}<option value={d.value}>{d.label}</option>{/each}
          </select>
        </label>

        <label class="check"><input type="checkbox" bind:checked={giftAid} /><span>I'm a UK taxpayer — add Gift Aid (+25%, at no cost to me).</span></label>

        <button class="btn btn-terra full" class:disabled={!valid} on:click={give} disabled={!valid}>
          {valid ? `Give ${sym}${amount.toLocaleString()}${frequency === 'monthly' ? ' monthly' : ''} →` : 'Enter an amount'}
        </button>
        <p class="secure">🔒 Secure checkout by Stripe · card details never touch this site</p>
      </div>
    </div>
  </header>

  <!-- ============ THREE WAYS ============ -->
  <section class="ways">
    <div class="wrap">
      <p class="eyebrow center">Where your gift goes</p>
      <h2 class="center">Three ways to <span class="ital-terra">give forward.</span></h2>
      <div class="ways-grid">
        {#each ways as w}
          <article class="way-card">
            <p class="no">{w.no}</p>
            <h3>{w.title}</h3>
            <p class="way-body">{w.body}</p>
            <ul class="ticks">
              {#each w.points as p}<li>{p}</li>{/each}
            </ul>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <!-- ============ SPONSORSHIP ============ -->
  <section class="sponsor" id="sponsor">
    <div class="wrap">
      <p class="eyebrow center">Sponsorship</p>
      <h2 class="center">Stand with the <span class="ital-terra">convocation.</span></h2>
      <p class="sub center">
        Sponsors make the summit possible and share in its standing. Four circles
        of support, each named for the regalia of sovereignty, with a bespoke
        path for founding partners of the movement.
      </p>

      <div class="sponsor-grid">
        {#each sponsorTiers as t}
          <article class="sponsor-card" class:presenting={t.presenting}>
            {#if t.presenting}<span class="ribbon">Presenting</span>{/if}
            <p class="no">♛ {t.no}</p>
            <h4>{t.name}</h4>
            <p class="role">{t.role}</p>
            <p class="big">{sym}{t.amount.toLocaleString()}</p>
            <p class="per">Per the 2026 convocation</p>
            <ul class="ticks">
              {#each t.points as p}<li>{p}</li>{/each}
            </ul>
            <button class="btn" class:btn-terra={t.presenting} class:btn-outline={!t.presenting} on:click={() => giveFixed(t.amount, `Sponsorship · ${t.name}`)}>
              Choose {t.name}
            </button>
          </article>
        {/each}
      </div>

      <div class="benefactor">
        <div>
          <h3>Founding Benefactor, <span class="ital-terra">by arrangement.</span></h3>
          <p>
            For partnerships beyond the Crown circle: naming a programme element,
            standing with the movement across the Caribbean and Africa, or a
            bespoke package shaped with the summit office.
          </p>
        </div>
        <button class="btn btn-terra" on:click={() => scrollTo('enquiry')}>Speak with the team</button>
      </div>
      <p class="fineprint center">
        Circle names honour the regalia of sovereignty. Benefits are indicative
        for the 2026 convocation and subject to protocol and confirmation by the
        summit office.
      </p>
    </div>
  </section>

  <!-- ============ SPONSOR ENQUIRY ============ -->
  <section class="enquiry" id="enquiry">
    <div class="wrap enq-grid">
      <div class="enq-copy">
        <p class="eyebrow">Sponsor enquiry</p>
        <h2>Let us shape it <span class="ital-terra">together.</span></h2>
        <p class="gift-lede">
          Sponsorships are confirmed in conversation with the summit office. Tell
          us which circle interests you, and the team will follow up with the
          detail and next steps.
        </p>
        <p class="enq-direct">Prefer to write directly? Reach the partnerships team at <a href="mailto:{CONTACT}">{CONTACT}</a>.</p>
      </div>

      <form class="panel" on:submit|preventDefault={sendEnquiry}>
        <div class="two">
          <label class="stack"><span class="field-label">Organisation</span><input bind:value={org} placeholder="Company or foundation" /></label>
          <label class="stack"><span class="field-label">Contact name</span><input bind:value={contactName} placeholder="Your name" /></label>
        </div>
        <div class="two">
          <label class="stack"><span class="field-label">Email</span><input bind:value={enqEmail} type="email" placeholder="you@email.com" /></label>
          <label class="stack"><span class="field-label">Phone (optional)</span><input bind:value={enqPhone} placeholder="Best number" /></label>
        </div>
        <label class="stack">
          <span class="field-label">Interested in</span>
          <select bind:value={interest}>
            <option>Sceptre · Supporter</option>
            <option>Diadem · Patron</option>
            <option>Throne · Benefactor</option>
            <option>Crown · Presenting Patron</option>
            <option>Founding Benefactor · by arrangement</option>
          </select>
        </label>
        <label class="stack"><span class="field-label">Message</span><textarea bind:value={message} rows="4" placeholder="Anything you would like the team to know"></textarea></label>
        <button class="btn btn-terra full" type="submit">Send enquiry</button>
      </form>
    </div>
  </section>

  <!-- ============ CLOSING BAND ============ -->
  <section class="band">
    <div class="marquee">Seat a Queen ✦ Amplify ✦ Sustain ✦ Unity ✦ Legacy ✦ Sovereignty ✦ Empowerment ✦ Seat a Queen</div>
    <div class="band-inner">
      <h2>One lineage. <span class="ital-terra">Many crowns.</span></h2>
      <p>Give today, and a queen takes her seat at the convocation of the century.</p>
      <div class="hero-cta center-cta">
        <button class="btn btn-terra" on:click={() => scrollTo('give')}>Give now</button>
        <button class="btn btn-ghost" on:click={() => scrollTo('sponsor')}>Become a sponsor</button>
      </div>
      <p class="band-mail">Or write to the summit team at <a href="mailto:{CONTACT}">{CONTACT}</a></p>
    </div>
  </section>
</div>

<style>
  .give { background: var(--paper); color: var(--ink); overflow-x: hidden; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 0 clamp(1.2rem, 4vw, 2.4rem); }
  .wrap-narrow { max-width: 820px; margin: 0 auto; padding: 0 clamp(1.2rem, 4vw, 2.4rem); }

  h2 {
    font-family: var(--font-display); font-weight: 300;
    font-size: clamp(2rem, 5.2vw, 3.4rem); letter-spacing: -0.015em; line-height: 1.04;
  }
  h3 { font-family: var(--font-display); font-weight: 400; }
  h4 { font-family: var(--font-display); font-weight: 500; }
  .center { text-align: center; }
  .ital-terra { font-family: var(--font-display); font-style: italic; color: var(--terracotta); font-weight: 340; }
  .accent { font-family: var(--font-display); font-style: italic; color: var(--terracotta-bright); font-weight: 340; }

  .eyebrow {
    text-transform: uppercase; letter-spacing: 0.22em; font-size: 0.7rem;
    font-weight: 600; color: var(--terracotta); margin-bottom: 1rem;
  }
  .eyebrow.center { text-align: center; }
  .eyebrow.gold { color: var(--gold-bright); }
  .eyebrow.small { font-size: 0.62rem; margin-bottom: 0.7rem; }

  /* ticks list */
  .ticks { list-style: none; padding: 0; margin: 1.4rem 0 0; display: grid; gap: 0.7rem; }
  .ticks li { position: relative; padding-left: 1.5rem; font-size: 0.94rem; line-height: 1.4; color: var(--ink-soft); }
  .ticks li::before { content: '◆'; position: absolute; left: 0; top: 0.05em; color: var(--terracotta); font-size: 0.7rem; }

  /* buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    font-family: var(--font-sans); font-weight: 600; font-size: 0.95rem;
    padding: 0.85rem 1.6rem; border-radius: 999px; cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; border: 1px solid transparent;
  }
  .btn-terra { background: var(--terracotta); color: var(--cream); }
  .btn-terra:hover { background: var(--terracotta-bright); }
  .btn-ghost { background: transparent; color: var(--cream); border-color: rgba(250,246,234,0.5); }
  .btn-ghost:hover { background: rgba(250,246,234,0.12); }
  .btn-outline { background: transparent; color: var(--forest); border-color: var(--line-strong); }
  .btn-outline:hover { background: var(--forest); color: var(--cream); border-color: var(--forest); }
  .btn.full { width: 100%; margin-top: 1rem; }
  .btn.disabled, .btn:disabled { opacity: 0.45; pointer-events: none; }

  /* ---------- HERO ---------- */
  .hero {
    background:
      radial-gradient(120% 80% at 80% 0%, rgba(61,99,73,0.55), transparent 60%),
      linear-gradient(160deg, #33513c 0%, #26402f 55%, #1e3325 100%);
    color: var(--cream); padding: clamp(4rem, 9vw, 7rem) 0;
  }
  .hero-grid { display: grid; grid-template-columns: 1.1fr 0.95fr; gap: clamp(2rem, 5vw, 3.6rem); align-items: center; }
  @media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr; } }
  .hero h1 {
    font-family: var(--font-display); font-weight: 340;
    font-size: clamp(2.8rem, 8vw, 5.4rem); line-height: 1.0; color: #fff; margin-bottom: 1.4rem;
  }
  .lede { color: rgba(250,246,234,0.86); font-size: clamp(1rem, 2vw, 1.15rem); max-width: 46ch; line-height: 1.6; }
  .trust { list-style: none; padding: 0; margin: 1.8rem 0 0; display: grid; gap: 0.55rem; }
  .trust li { position: relative; padding-left: 1.5rem; font-size: 0.9rem; color: rgba(250,246,234,0.82); }
  .trust li::before { content: '◆'; position: absolute; left: 0; top: 0.05em; color: var(--terracotta-bright); font-size: 0.65rem; }
  .link-ghost {
    display: inline-block; margin-top: 1.8rem; background: none; border: none;
    color: var(--gold-bright); font-family: var(--font-sans); font-weight: 600;
    font-size: 0.92rem; cursor: pointer; padding: 0;
  }
  .link-ghost:hover { color: #fff; }
  .hero .panel { box-shadow: 0 30px 70px rgba(0,0,0,0.35); }

  /* ---------- THREE WAYS ---------- */
  .ways { background: var(--paper); padding: clamp(4.5rem, 9vw, 7rem) 0; }
  .ways h2 { margin-top: 0.4rem; }
  .ways-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem; margin-top: 3rem; }
  @media (max-width: 860px) { .ways-grid { grid-template-columns: 1fr; max-width: 480px; margin-inline: auto; } }
  .way-card { background: var(--cream); border: 1px solid var(--line); border-radius: 14px; padding: clamp(1.6rem, 3vw, 2.2rem); }
  .way-card .no { font-family: var(--font-display); font-style: italic; color: var(--terracotta); font-size: 0.95rem; margin-bottom: 0.8rem; }
  .way-card h3 { font-size: 1.5rem; margin-bottom: 0.8rem; }
  .way-body { color: var(--ink-soft); font-size: 0.95rem; line-height: 1.6; }

  /* ---------- GIFT PANEL ---------- */
  .gift-lede { color: var(--ink-soft); font-size: 1.02rem; line-height: 1.65; max-width: 44ch; }

  .panel {
    background: var(--cream); border: 1px solid var(--line);
    border-radius: 18px; padding: clamp(1.5rem, 3vw, 2.2rem);
    box-shadow: 0 24px 60px rgba(35,28,21,0.1);
  }
  .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
  .panel-head h3 { font-size: 1.5rem; font-style: italic; font-weight: 300; }

  .seg { display: inline-flex; background: var(--paper-deep); border-radius: 999px; padding: 4px; gap: 2px; }
  .seg.wide { display: flex; width: 100%; margin-bottom: 1.4rem; }
  .seg.wide button { flex: 1; }
  .seg button {
    border: none; background: transparent; padding: 0.5rem 0.9rem; border-radius: 999px;
    font-size: 0.82rem; font-weight: 600; color: var(--muted); cursor: pointer; transition: all 0.15s ease;
  }
  .seg.small button { padding: 0.35rem 0.7rem; font-size: 0.72rem; }
  .seg button.on { background: var(--cream); color: var(--ink); box-shadow: 0 1px 4px rgba(35,28,21,0.14); }

  .field-label { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.68rem; font-weight: 600; color: var(--muted); }
  .amounts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin: 0.6rem 0 0.9rem; }
  .amt {
    border: 1px solid var(--line-strong); background: var(--paper); border-radius: 10px;
    padding: 0.8rem 0.5rem; font-size: 1rem; font-weight: 600; color: var(--ink); cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 2px; transition: all 0.15s ease;
  }
  .amt:hover { border-color: var(--forest); }
  .amt.on { background: var(--forest); color: var(--cream); border-color: var(--forest); }
  .amt.other { padding: 0; overflow: hidden; }
  .amt.other span { padding-left: 0.7rem; color: var(--muted); }
  .amt.other input { border: none; background: transparent; padding: 0.8rem 0.5rem; width: 100%; font: inherit; font-weight: 600; color: inherit; outline: none; }
  .amt.other.on { background: var(--forest); color: var(--cream); }
  .amt.other.on span { color: rgba(250,246,234,0.8); }
  .amt.other.on input::placeholder { color: rgba(250,246,234,0.6); }

  .helper {
    background: var(--paper); border: 1px solid var(--line); border-radius: 10px;
    padding: 0.7rem 0.9rem; font-size: 0.84rem; color: var(--ink-soft); margin-bottom: 1.3rem;
  }

  .stack { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
  @media (max-width: 480px) { .two { grid-template-columns: 1fr; } }
  select, input[type='email'], input[type='text'], .stack input, textarea {
    font-family: var(--font-sans); font-size: 0.95rem; color: var(--ink);
    background: var(--paper); border: 1px solid var(--line-strong); border-radius: 10px;
    padding: 0.7rem 0.85rem; width: 100%;
  }
  textarea { resize: vertical; }
  select { cursor: pointer; }
  .check { display: flex; gap: 0.6rem; align-items: flex-start; margin: 0.2rem 0 0.4rem; font-size: 0.84rem; color: var(--ink-soft); line-height: 1.4; }
  .check input { margin-top: 0.15rem; accent-color: var(--terracotta); }
  .secure { text-align: center; font-size: 0.78rem; color: var(--muted); margin-top: 0.9rem; }

  /* ---------- SEAT A QUEEN ---------- */
  .seat { background: var(--forest); color: var(--cream); padding: clamp(4.5rem, 9vw, 7rem) 0; }
  .seat h2.light { color: #fff; }
  .light-sub { color: rgba(250,246,234,0.8); }
  .sub { max-width: 60ch; margin: 1rem auto 0; font-size: 1.02rem; line-height: 1.6; }
  .seat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 3rem 0 2rem; }
  @media (max-width: 900px) { .seat-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 520px) { .seat-grid { grid-template-columns: 1fr; } }
  .seat-card {
    background: rgba(250,246,234,0.05); border: 1px solid rgba(250,246,234,0.16);
    border-radius: 14px; padding: 1.6rem 1.4rem; display: flex; flex-direction: column;
  }
  .seat-card.feature { background: rgba(200,90,46,0.16); border-color: var(--terracotta); }
  .seat-card .tag { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.64rem; font-weight: 700; color: var(--gold-bright); margin-bottom: 0.8rem; }
  .seat-card.feature .tag { color: var(--terracotta-soft); }
  .seat-card .big { font-family: var(--font-display); font-weight: 400; font-size: 2rem; color: #fff; }
  .seat-card h4 { font-size: 1.15rem; color: #fff; margin: 0.3rem 0 0.5rem; }
  .seat-body { font-size: 0.86rem; color: rgba(250,246,234,0.78); line-height: 1.5; flex: 1; margin-bottom: 1.2rem; }
  .seat-card .btn-outline { color: var(--cream); border-color: rgba(250,246,234,0.4); }
  .seat-card .btn-outline:hover { background: var(--cream); color: var(--forest); border-color: var(--cream); }
  .goal { margin-top: 1rem; font-size: 0.9rem; }
  .goal strong { color: var(--terracotta-soft); }

  /* ---------- SPONSORSHIP ---------- */
  .sponsor { background: var(--paper); padding: clamp(4.5rem, 9vw, 7rem) 0; }
  .sponsor h2 { margin-top: 0.4rem; }
  .sponsor-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 3rem 0 2.4rem; }
  @media (max-width: 960px) { .sponsor-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 520px) { .sponsor-grid { grid-template-columns: 1fr; } }
  .sponsor-card {
    position: relative; background: var(--cream); border: 1px solid var(--line);
    border-radius: 14px; padding: 1.6rem 1.4rem; display: flex; flex-direction: column;
  }
  .sponsor-card.presenting { background: var(--forest); color: var(--cream); border-color: var(--forest); }
  .sponsor-card .no { font-family: var(--font-display); font-style: italic; color: var(--terracotta); font-size: 0.9rem; margin-bottom: 0.6rem; }
  .sponsor-card.presenting .no { color: var(--gold-bright); }
  .sponsor-card h4 { font-size: 1.4rem; }
  .sponsor-card.presenting h4 { color: #fff; }
  .sponsor-card .role { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.62rem; font-weight: 700; color: var(--muted); margin: 0.15rem 0 0.8rem; }
  .sponsor-card.presenting .role { color: var(--terracotta-soft); }
  .sponsor-card .big { font-family: var(--font-display); font-weight: 400; font-size: 1.8rem; }
  .sponsor-card.presenting .big { color: #fff; }
  .sponsor-card .per { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.6rem; color: var(--muted); margin-bottom: 0.6rem; }
  .sponsor-card.presenting .per { color: var(--terracotta-soft); }
  .sponsor-card .ticks { margin: 0.4rem 0 1.3rem; flex: 1; }
  .sponsor-card .ticks li { font-size: 0.82rem; }
  .sponsor-card.presenting .ticks li { color: rgba(250,246,234,0.85); }
  .sponsor-card.presenting .ticks li::before { color: var(--terracotta-bright); }
  .sponsor-card .btn-outline:hover { background: var(--forest); color: var(--cream); }
  .ribbon {
    position: absolute; top: -10px; left: 1.4rem; background: var(--terracotta);
    color: var(--cream); font-size: 0.6rem; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; padding: 0.25rem 0.7rem; border-radius: 999px;
  }

  .benefactor {
    background: var(--ink); color: var(--cream); border-radius: 16px;
    padding: clamp(1.6rem, 3vw, 2.4rem); display: flex; align-items: center;
    justify-content: space-between; gap: 2rem; margin-top: 1rem;
  }
  @media (max-width: 720px) { .benefactor { flex-direction: column; align-items: flex-start; } }
  .benefactor h3 { font-size: 1.6rem; color: #fff; margin-bottom: 0.6rem; }
  .benefactor p { color: rgba(250,246,234,0.75); font-size: 0.92rem; line-height: 1.6; max-width: 60ch; }
  .benefactor .btn-terra { white-space: nowrap; }
  .fineprint { color: var(--muted); font-size: 0.78rem; margin-top: 1.6rem; max-width: 58ch; margin-inline: auto; }

  /* ---------- ENQUIRY ---------- */
  .enquiry { background: var(--paper-soft); padding: clamp(4.5rem, 9vw, 7rem) 0; }
  .enq-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: clamp(2rem, 5vw, 4rem); align-items: start; }
  @media (max-width: 900px) { .enq-grid { grid-template-columns: 1fr; } }
  .enq-copy h2 { margin: 0.4rem 0 1.2rem; }
  .enq-direct { margin-top: 1.4rem; font-size: 0.9rem; color: var(--ink-soft); }

  /* ---------- BAND ---------- */
  .band { background: #1a130c; color: var(--cream); padding: clamp(4rem, 8vw, 6rem) 0 clamp(4.5rem, 9vw, 7rem); text-align: center; overflow: hidden; }
  .marquee {
    font-family: var(--font-display); font-style: italic; font-size: 1.1rem;
    color: rgba(250,246,234,0.28); white-space: nowrap; text-align: center;
    margin-bottom: 2.6rem; letter-spacing: 0.02em;
  }
  .band-inner { max-width: 640px; margin: 0 auto; padding: 0 1.2rem; }
  .band h2 { font-size: clamp(2.2rem, 6vw, 3.6rem); color: #fff; }
  .band p { color: rgba(250,246,234,0.75); margin-top: 1rem; }
  .center-cta { justify-content: center; margin-top: 2rem; }
  .band-mail { font-size: 0.85rem; margin-top: 1.6rem; }
  .band-mail a { color: var(--gold-bright); }
</style>
