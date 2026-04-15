<footer>
  <div class="container">
    <div class="top">
      <div class="brand">
        <svg class="logo" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="1" />
          <path d="M12 24 L14 16 L18 22 L20 14 L22 22 L26 16 L28 24 Z" fill="currentColor" />
        </svg>
        <div class="n">African Queens Summit</div>
        <div class="s">England · 14 – 31 August 2026</div>
        <p class="motto">"Royalty Defined by Impact."</p>
        <p class="mission">
          Promoting Cultural Heritage · Empowering Communities · Advancing Humanitarian Initiatives
        </p>
      </div>

      <div class="cols">
        <div>
          <h5>The Summit</h5>
          <a href="#summit">Overview</a>
          <a href="#convener">Convener</a>
          <a href="#pillars">Four Pillars</a>
          <a href="#lineage">The Lineage</a>
          <a href="#programme">Programme</a>
          <a href="#partners">Partners</a>
        </div>
        <div>
          <h5>Office of the Convener</h5>
          <p>ARUK II Humanitarian Services</p>
          <p>Hawkhill Place, Stanton St John</p>
          <p>Oxford OX33 1HS</p>
          <p class="reg">UK Reg. No. 17110628</p>
        </div>
        <div>
          <h5>Connect</h5>
          <a href="mailto:obonganwan.aruk@yahoo.co.uk">obonganwan.aruk@yahoo.co.uk</a>
          <a href="tel:+447932506556">+44 7932 506 556</a>
          <a href="tel:+2347062774657">+234 706 277 4657</a>
          <a href="https://globalqueenssummit.com">globalqueenssummit.com</a>
        </div>
      </div>
    </div>

    <div class="ipada">
      <span class="glyph">◈</span>
      <span>In partnership with <strong>IPADA Initiatives</strong> — cultural impact, education, and empowerment across Africa and the Diaspora.</span>
    </div>

    <div class="bottom">
      <span>© 2026 Queen Aruk II Foundation</span>
      <span class="middle">Unity · Legacy · Sovereignty · Empowerment</span>
      <span>London · Oxford · Calabar · Nairobi</span>
    </div>
  </div>
</footer>

<style>
  footer {
    background: var(--ink);
    color: var(--cream);
    padding: 5rem 0 2rem;
  }
  .top {
    display: grid;
    grid-template-columns: 1.1fr 1.8fr;
    gap: 4rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid rgba(250, 246, 234, 0.12);
  }
  .logo {
    width: 38px;
    height: 38px;
    color: var(--terracotta-bright);
    margin-bottom: 1rem;
  }
  .n {
    font-family: var(--font-display);
    font-size: 1.3rem;
    color: var(--cream);
  }
  .s {
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    margin-top: 3px;
    margin-bottom: 1rem;
  }
  .motto {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--cream);
    font-size: 1.15rem;
    margin-bottom: 0.75rem;
  }
  .mission {
    color: rgba(250, 246, 234, 0.6);
    max-width: 40ch;
    font-size: 0.85rem;
    line-height: 1.6;
  }

  .cols {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  h5 {
    font-family: var(--font-sans);
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    margin-bottom: 1.25rem;
    font-weight: 500;
  }
  .cols a, .cols p {
    display: block;
    color: rgba(250, 246, 234, 0.85);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    line-height: 1.45;
  }
  .cols a:hover { color: var(--terracotta-bright); }
  .cols .reg {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    color: rgba(250, 246, 234, 0.5);
    margin-top: 0.5rem;
    text-transform: uppercase;
  }

  .ipada {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 1.5rem 0;
    border-bottom: 1px solid rgba(250, 246, 234, 0.08);
    color: rgba(250, 246, 234, 0.75);
    font-family: var(--font-display);
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.5;
    max-width: 720px;
  }
  .ipada .glyph {
    color: var(--terracotta-bright);
    font-style: normal;
    font-size: 1rem;
    line-height: 1.4;
  }
  .ipada strong {
    color: var(--terracotta-bright);
    font-weight: 500;
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    color: rgba(250, 246, 234, 0.5);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    gap: 1rem;
  }
  .middle {
    color: var(--terracotta-bright);
    letter-spacing: 0.18em;
  }

  @media (max-width: 960px) {
    .top { grid-template-columns: 1fr; gap: 3rem; }
    .cols { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 600px) {
    .cols { grid-template-columns: 1fr; }
    .bottom {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
