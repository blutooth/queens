<script>
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';

  // UK WhatsApp number — international format, no +, no spaces
  const phone = '447932506556';
  const prefill = encodeURIComponent(
    "Hello — I'd like to reserve a place at the African Queens Summit (14–31 August 2026, London & Oxford)."
  );
  const waLink = `https://wa.me/${phone}?text=${prefill}`;

  let qrSvg = '';

  // vCalendar event — scanning this on a phone adds the summit to the calendar
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ARUK II Foundation//African Queens Summit//EN',
    'BEGIN:VEVENT',
    'UID:african-queens-summit-2026@africanqueenssummit.com',
    'DTSTAMP:20260415T120000Z',
    'DTSTART:20260814T180000Z',
    'DTEND:20260831T220000Z',
    'SUMMARY:African Queens Summit',
    'LOCATION:Porchester Hall, London; Hawkhill Place, Oxford; University of Oxford',
    'DESCRIPTION:The African & Diaspora Queens Summit — a convocation of 100 queens of Africa and the Diaspora. Convened by Her Royal Majesty Queen Aruk II. https://africanqueenssummit.com',
    'URL:https://africanqueenssummit.com',
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
      </aside>

      <!-- WhatsApp RSVP -->
      <div class="wa-wrap">
        <div class="wa-card">
          <div class="wa-head">
            <svg class="wa-logo" viewBox="0 0 32 32" aria-hidden="true">
              <path fill="currentColor" d="M16 3C8.82 3 3 8.82 3 16c0 2.29.6 4.44 1.66 6.3L3 29l6.92-1.62A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.67c-2.08 0-4.02-.58-5.67-1.58l-.41-.24-4.1.96.98-4-.27-.42A10.67 10.67 0 1 1 26.67 16c0 5.89-4.78 10.67-10.67 10.67zm6.13-7.98c-.34-.17-1.99-.98-2.3-1.09-.31-.11-.53-.17-.76.17-.22.33-.87 1.09-1.06 1.3-.2.22-.39.24-.72.08-.34-.17-1.43-.52-2.72-1.66a10.28 10.28 0 0 1-1.9-2.36c-.2-.34 0-.52.15-.68.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.6-.09-.17-.76-1.85-1.05-2.53-.27-.66-.55-.57-.76-.58l-.65-.01a1.25 1.25 0 0 0-.9.42c-.3.33-1.17 1.15-1.17 2.8 0 1.66 1.2 3.25 1.37 3.48.17.22 2.37 3.62 5.75 5.07.8.34 1.43.54 1.92.7.8.26 1.54.22 2.11.13.64-.1 1.99-.81 2.27-1.6.28-.78.28-1.46.2-1.6-.08-.14-.3-.22-.64-.39z"/>
            </svg>
            <span class="wa-label">WhatsApp</span>
          </div>
          <h3>Reserve by message.</h3>
          <p>
            The fastest way to confirm your place is a direct message to the Office of the
            Convener on WhatsApp. We reply within 24 hours with availability and a place in
            your chosen tier.
          </p>

          <a class="wa-btn" href={waLink} target="_blank" rel="noopener">
            <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
              <path fill="currentColor" d="M16 3C8.82 3 3 8.82 3 16c0 2.29.6 4.44 1.66 6.3L3 29l6.92-1.62A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.13 15.69c-.34-.17-1.99-.98-2.3-1.09-.31-.11-.53-.17-.76.17-.22.33-.87 1.09-1.06 1.3-.2.22-.39.24-.72.08-.34-.17-1.43-.52-2.72-1.66a10.28 10.28 0 0 1-1.9-2.36c-.2-.34 0-.52.15-.68.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.6-.09-.17-.76-1.85-1.05-2.53-.27-.66-.55-.57-.76-.58l-.65-.01a1.25 1.25 0 0 0-.9.42c-.3.33-1.17 1.15-1.17 2.8 0 1.66 1.2 3.25 1.37 3.48.17.22 2.37 3.62 5.75 5.07.8.34 1.43.54 1.92.7.8.26 1.54.22 2.11.13.64-.1 1.99-.81 2.27-1.6.28-.78.28-1.46.2-1.6-.08-.14-.3-.22-.64-.39z"/>
            </svg>
            Message on WhatsApp
          </a>
          <p class="wa-num">+44 7932 506 556</p>

          <div class="wa-alt">
            <div class="alt-k">Prefer email or telephone?</div>
            <a href="mailto:obonganwan.aruk@yahoo.co.uk">obonganwan.aruk@yahoo.co.uk</a>
            <a href="tel:+447932506556">+44 7932 506 556</a>
            <a href="tel:+2347062774657">+234 706 277 4657</a>
          </div>
        </div>
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
  .qr-panel { position: sticky; top: 6rem; }
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

  /* WhatsApp card */
  .wa-card {
    background: linear-gradient(160deg, #1f3d2f, #0f231b);
    color: var(--cream);
    padding: 2.5rem 2.25rem;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }
  .wa-card::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -20%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37, 211, 102, 0.18), transparent 70%);
    pointer-events: none;
  }

  .wa-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.75rem;
    position: relative;
  }
  .wa-logo {
    width: 28px;
    height: 28px;
    color: #25d366;
  }
  .wa-label {
    font-size: 0.7rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: #25d366;
    font-weight: 500;
  }

  .wa-card h3 {
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 400;
    line-height: 1.05;
    margin-bottom: 1.25rem;
    color: var(--cream);
  }
  .wa-card p {
    color: rgba(250, 246, 234, 0.85);
    font-size: 1rem;
    line-height: 1.55;
    margin-bottom: 2rem;
    max-width: 52ch;
  }

  .wa-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.05rem 1.75rem;
    background: #25d366;
    color: #0b2a1f;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }
  .wa-btn:hover {
    background: #30e377;
    color: #0b2a1f;
    transform: translateY(-1px);
    box-shadow: 0 14px 32px -10px rgba(37, 211, 102, 0.5);
  }
  .wa-num {
    font-family: var(--font-display);
    font-style: italic;
    color: rgba(250, 246, 234, 0.7);
    font-size: 1rem;
    margin-top: 0.85rem !important;
  }

  .wa-alt {
    margin-top: 2.25rem;
    padding-top: 1.75rem;
    border-top: 1px solid rgba(250, 246, 234, 0.15);
    position: relative;
  }
  .alt-k {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(250, 246, 234, 0.55);
    margin-bottom: 0.85rem;
    font-weight: 500;
  }
  .wa-alt a {
    display: block;
    font-family: var(--font-display);
    font-size: 1.05rem;
    color: var(--cream);
    margin-bottom: 0.35rem;
    line-height: 1.4;
  }
  .wa-alt a:hover { color: #25d366; }

  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; }
    .qr-panel { position: static; }
    .wa-card { padding: 2rem 1.5rem; }
  }
</style>
