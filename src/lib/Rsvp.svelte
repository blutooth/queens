<script>
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';

  let name = '';
  let email = '';
  let title_ = '';
  let country = '';
  let capacity = 'Queen / Traditional Ruler';
  let message = '';
  let tier = 'Royal Guest';
  let submitted = false;
  let qrSvg = '';

  // vCalendar event — scanning this on a phone adds the summit to the calendar
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ARUK II Foundation//African Queens Summit//EN',
    'BEGIN:VEVENT',
    'UID:african-queens-summit-2026@globalqueenssummit.com',
    'DTSTAMP:20260415T120000Z',
    'DTSTART:20260814T180000Z',
    'DTEND:20260831T220000Z',
    'SUMMARY:African Queens Summit',
    'LOCATION:Porchester Hall, London; Hawkhill Place, Oxford; University of Oxford',
    'DESCRIPTION:The African & Diaspora Queens Summit — a convocation of 100 queens of Africa and the Diaspora. Convened by Her Royal Majesty Queen Aruk II. Tickets and info: https://globalqueenssummit.com',
    'URL:https://globalqueenssummit.com',
    'ORGANIZER;CN=Queen Aruk II Foundation:mailto:obonganwan.aruk@yahoo.co.uk',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  onMount(async () => {
    qrSvg = await QRCode.toString(ics, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: { dark: '#231c15', light: '#f7f1e300' },
    });
  });

  function submit(e) {
    e.preventDefault();
    submitted = true;
  }
</script>

<section id="rsvp" class="rsvp">
  <div class="container">
    <div class="head">
      <p class="eyebrow">Reserve your place</p>
      <h2>
        A seat at the<br />
        <span class="italic">royal table.</span>
      </h2>
      <p class="lede">
        Places are reserved for participating queens, first-class kings,
        traditional rulers, invited scholars, and honoured guests.
      </p>
    </div>

    <div class="grid">
      <!-- QR panel -->
      <aside class="qr-panel">
        <div class="qr-inner">
          <div class="qr-head">
            <span class="crown">♕</span>
            <div>
              <div class="k">Save the date</div>
              <div class="v">Scan with camera</div>
            </div>
          </div>

          <div class="qr">{@html qrSvg}</div>

          <div class="qr-foot">
            <div class="dates">14 – 31 August 2026</div>
            <div class="places">London · Oxford</div>
            <a class="dl" href={'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)} download="african-queens-summit.ics">
              Add to calendar ↗
            </a>
          </div>
        </div>

        <div class="contact">
          <div class="c-k">Office of the Convener</div>
          <a href="mailto:obonganwan.aruk@yahoo.co.uk">obonganwan.aruk@yahoo.co.uk</a>
          <a href="tel:+447932506556">+44 7932 506 556</a>
        </div>
      </aside>

      <!-- Form -->
      <div class="form-wrap">
        {#if !submitted}
          <form on:submit={submit}>
            <div class="row-2">
              <label>
                <span>Full Name</span>
                <input type="text" bind:value={name} required />
              </label>
              <label>
                <span>Royal Title / Honour</span>
                <input type="text" bind:value={title_} placeholder="Optional" />
              </label>
            </div>
            <div class="row-2">
              <label>
                <span>Email</span>
                <input type="email" bind:value={email} required />
              </label>
              <label>
                <span>Country of Origin</span>
                <input type="text" bind:value={country} />
              </label>
            </div>
            <div class="row-2">
              <label>
                <span>Attending as</span>
                <select bind:value={capacity}>
                  <option>Queen / Traditional Ruler</option>
                  <option>First-Class King</option>
                  <option>Chief / Elder</option>
                  <option>Scholar / Speaker</option>
                  <option>Diaspora Guest</option>
                  <option>Media / Press</option>
                  <option>Supporter / Observer</option>
                </select>
              </label>
              <label>
                <span>Tier</span>
                <select bind:value={tier}>
                  <option>Observer · £1,200</option>
                  <option>Royal Guest · £4,500</option>
                  <option>Patron · £12,000</option>
                </select>
              </label>
            </div>
            <label>
              <span>Message to the Convener (optional)</span>
              <textarea bind:value={message} rows="3" placeholder="Protocol, dietary needs, accompaniments..."></textarea>
            </label>
            <button type="submit" class="submit">Submit registration →</button>
            <p class="note">The Convener's office will respond within 72 hours with confirmation and payment instructions.</p>
          </form>
        {:else}
          <div class="confirm">
            <div class="seal">♕</div>
            <h3>Thank you, {title_ || 'honoured guest'}.</h3>
            <p>
              Your place is held. The Office of the Convener will reach you at
              <strong>{email}</strong> with confirmation, protocol, and the full programme.
            </p>
            <p class="sig">— Queen Aruk II Foundation · Oxford</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .rsvp {
    background: var(--paper);
  }

  .head {
    max-width: 720px;
    margin: 0 auto 4rem;
    text-align: center;
  }
  h2 {
    font-size: clamp(2.25rem, 5vw, 3.75rem);
    font-weight: 400;
    margin: 1rem 0 1.25rem;
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .lede {
    color: var(--ink-soft);
    font-size: 1.05rem;
    line-height: 1.55;
    max-width: 540px;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 2.5rem;
    align-items: start;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* QR panel */
  .qr-panel {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    position: sticky;
    top: 6rem;
  }
  .qr-inner {
    background: var(--paper-soft);
    border-radius: 4px;
    padding: 1.75rem 1.5rem;
    text-align: center;
  }
  .qr-head {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding-bottom: 1.25rem;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid var(--line);
    text-align: left;
  }
  .crown {
    font-size: 1.8rem;
    color: var(--terracotta);
    line-height: 1;
  }
  .k {
    font-size: 0.62rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.2rem;
  }
  .v {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--ink);
    line-height: 1;
  }

  .qr {
    background: var(--cream);
    padding: 1.25rem;
    border-radius: 3px;
    max-width: 240px;
    margin: 0 auto 1.25rem;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .qr-foot { text-align: center; }
  .dates {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--ink);
    font-style: italic;
  }
  .places {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 0.3rem;
    margin-bottom: 1rem;
  }
  .dl {
    display: inline-block;
    font-size: 0.8rem;
    color: var(--terracotta);
    border-bottom: 1px solid var(--terracotta);
    padding-bottom: 0.15rem;
    font-weight: 500;
  }
  .dl:hover { color: var(--ink); border-color: var(--ink); }

  .contact {
    background: var(--paper-soft);
    padding: 1.5rem;
    border-radius: 4px;
  }
  .c-k {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.75rem;
    font-weight: 500;
  }
  .contact a {
    display: block;
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--ink);
    margin-bottom: 0.35rem;
    line-height: 1.3;
  }
  .contact a:hover { color: var(--terracotta); }

  /* Form */
  .form-wrap {
    background: var(--paper-soft);
    padding: 2.5rem;
    border-radius: 4px;
  }
  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1.25rem;
  }
  .row-2 label { margin-bottom: 0; }
  label span {
    font-size: 0.66rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }
  input, select, textarea {
    background: var(--paper);
    border: 1px solid var(--line);
    padding: 0.8rem 1rem;
    color: var(--ink);
    font-family: inherit;
    font-size: 0.98rem;
    border-radius: 3px;
    transition: border-color 0.2s ease;
    resize: vertical;
    width: 100%;
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--terracotta);
  }

  .submit {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
    padding: 1.15rem;
    background: var(--ink);
    color: var(--cream);
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    font-weight: 500;
    border-radius: 999px;
    transition: all 0.2s ease;
  }
  .submit:hover {
    background: var(--terracotta);
    transform: translateY(-1px);
  }
  .note {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.82rem;
    color: var(--muted);
  }

  .confirm { padding: 2rem 0; text-align: center; }
  .seal {
    font-size: 3.5rem;
    color: var(--terracotta);
    margin-bottom: 1rem;
  }
  .confirm h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
    font-weight: 400;
  }
  .confirm p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    max-width: 460px;
    margin: 0 auto 1rem;
    line-height: 1.5;
  }
  .confirm strong {
    color: var(--terracotta);
    font-weight: 500;
  }
  .sig {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--muted) !important;
    font-size: 0.95rem !important;
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; }
    .qr-panel { position: static; flex-direction: row; flex-wrap: wrap; }
    .qr-inner { flex: 1; min-width: 260px; }
    .contact { flex: 1; min-width: 260px; }
    .form-wrap { padding: 2rem 1.5rem; }
    .row-2 { grid-template-columns: 1fr; gap: 0; }
    .row-2 label { margin-bottom: 1.25rem; }
  }
</style>
