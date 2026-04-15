<section id="rsvp-cta" class="cta">
  <div class="container">
    <div class="card">
      <p class="eyebrow">Your place at the royal table</p>
      <h2>
        Reserve for<br />
        <span class="italic">the convocation.</span>
      </h2>
      <p class="lede">
        Three tiers — Observer · Royal Guest · Patron.
        Direct WhatsApp RSVP with the Office of the Convener.
      </p>
      <div class="row">
        <a href="/rsvp/" class="btn primary">View pricing &amp; RSVP →</a>
        <a href="/rsvp/" class="btn ghost">Message the Convener</a>
      </div>
      <p class="note">
        <span class="glyph">♕</span>
        Registration closes when places are filled · 14 – 31 August 2026 · London &amp; Oxford
      </p>
    </div>
  </div>
</section>

<style>
  .cta {
    background: var(--paper-soft);
    padding-top: 5rem;
    padding-bottom: 5rem;
  }
  .card {
    max-width: 860px;
    margin: 0 auto;
    padding: 4rem 3rem;
    background: var(--ink);
    color: var(--cream);
    border-radius: 4px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content: '';
    position: absolute;
    inset: -50% auto auto -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(224, 119, 77, 0.15), transparent 60%);
    pointer-events: none;
  }
  .card::after {
    content: '';
    position: absolute;
    inset: auto -20% -50% auto;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(166, 124, 61, 0.12), transparent 60%);
    pointer-events: none;
  }

  .eyebrow {
    color: var(--terracotta-bright);
    position: relative;
  }
  h2 {
    font-family: var(--font-display);
    font-size: clamp(2.25rem, 5vw, 3.75rem);
    font-weight: 400;
    line-height: 1.02;
    margin: 1rem 0 1.5rem;
    color: var(--cream);
    position: relative;
  }
  .italic { font-style: italic; color: var(--terracotta-bright); font-weight: 300; }

  .lede {
    font-size: 1.1rem;
    color: rgba(250, 246, 234, 0.82);
    max-width: 500px;
    margin: 0 auto 2.5rem;
    line-height: 1.55;
    position: relative;
  }

  .row {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2.25rem;
    flex-wrap: wrap;
    position: relative;
  }
  .btn {
    padding: 1rem 1.85rem;
    font-size: 0.88rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    border-radius: 999px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    color: inherit;
  }
  .primary {
    background: var(--terracotta-bright);
    color: var(--ink);
  }
  .primary:hover {
    background: var(--cream);
    color: var(--ink);
    transform: translateY(-1px);
  }
  .ghost {
    border-color: rgba(250, 246, 234, 0.35);
    color: var(--cream);
  }
  .ghost:hover {
    border-color: var(--cream);
    background: rgba(250, 246, 234, 0.06);
  }

  .note {
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    color: rgba(250, 246, 234, 0.55);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .note .glyph { color: var(--terracotta-bright); }

  @media (max-width: 640px) {
    .card { padding: 3rem 1.5rem; }
  }
</style>
