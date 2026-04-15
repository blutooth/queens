<script>
  import { asset } from './asset.js';
</script>

<section id="convener" class="convener">
  <div class="container grid">
    <figure class="portrait portrait-rich">
      <img src={asset('/images/queen-aruk-ii-portrait.jpg')} alt="Queen Aruk II in processional regalia" />
      <figcaption>
        <span class="crown">♕</span>
        <span>Obonganwan · Queen Aruk II</span>
      </figcaption>
    </figure>

    <div class="body">
      <p class="eyebrow">A word from the Convener</p>
      <h2>
        <span class="italic">"A unifying</span><br />
        and empowering<br />
        platform."<span class="quote-mark">”</span>
      </h2>

      <div class="quote">
        <p>
          I write in the spirit of goodwill, shared humanity, and the enduring
          bonds between the United Kingdom and the peoples of Africa and the Diaspora.
        </p>
        <p>
          This historic gathering is conceived as a platform for African and
          Diaspora Queens — strengthening cultural heritage, advancing women's
          leadership, and reinforcing the role of traditional institutions across
          Africa and beyond.
        </p>
      </div>

      <div class="sign">
        <div class="signature">Queen Aruk II</div>
        <div class="role">Her Royal Majesty · Summit Convener</div>
        <div class="org">ARUK II Humanitarian Services (UK) C.I.C</div>
      </div>
    </div>
  </div>
</section>

<style>
  .convener {
    background: var(--paper-soft);
    position: relative;
  }

  .grid {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 5rem;
    align-items: center;
  }

  .portrait {
    position: relative;
    aspect-ratio: 4 / 5;
    max-width: 480px;
  }
  .portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 3px;
    box-shadow: 0 30px 80px -25px rgba(35, 28, 21, 0.4);
  }
  figcaption {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    background: rgba(247, 241, 227, 0.96);
    backdrop-filter: blur(8px);
    padding: 0.85rem 1.1rem;
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .crown {
    color: var(--terracotta);
    font-size: 1.2rem;
  }

  h2 {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    margin: 1rem 0 2.5rem;
    line-height: 1;
    font-weight: 300;
    position: relative;
  }
  .italic { font-style: italic; color: var(--terracotta); }
  .quote-mark {
    font-style: italic;
    color: var(--terracotta);
    font-family: var(--font-display);
  }

  .quote {
    padding: 2rem 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    margin-bottom: 2rem;
  }
  .quote p {
    font-size: 1.1rem;
    line-height: 1.65;
    color: var(--ink-soft);
    margin-bottom: 1rem;
  }
  .quote p:last-child { margin-bottom: 0; }

  .signature {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 2rem;
    color: var(--ink);
    line-height: 1;
    margin-bottom: 0.5rem;
    font-weight: 300;
  }
  .role {
    font-size: 0.85rem;
    color: var(--ink);
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }
  .org {
    font-size: 0.75rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }

  @media (max-width: 960px) {
    .grid { grid-template-columns: 1fr; gap: 3rem; }
    .portrait { margin: 0 auto; }
  }
</style>
