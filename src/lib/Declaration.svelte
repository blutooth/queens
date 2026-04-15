<script>
  const articles = [
    {
      num: 'I',
      title: 'Unity of African Queens',
      body: 'We affirm our commitment to sustained unity, cooperation, and mutual recognition among African Queens globally.',
    },
    {
      num: 'II',
      title: 'Land Sovereignty & Restorative Justice',
      body: 'We assert the centrality of land to African identity, dignity, and economic justice, and commit to advancing restorative and reparative frameworks through lawful, diplomatic, and moral channels.',
    },
    {
      num: 'III',
      title: 'Cultural Preservation & Repatriation',
      body: 'We call for the protection, restitution, and dignified preservation of African cultural heritage and royal artifacts.',
    },
    {
      num: 'IV',
      title: 'Women, Peace & Governance',
      body: 'We recognize African Queens as strategic actors in peacebuilding, governance, and societal stability.',
    },
    {
      num: 'V',
      title: 'Legacy & Continuity',
      body: 'We commit to nurturing the next generation of royal leadership through mentorship, education, and institutional continuity.',
    },
  ];
</script>

<section id="declaration" class="declaration">
  <div class="container-narrow">
    <header>
      <div class="rule"></div>
      <p class="eyebrow">United Kingdom · 2026</p>
      <h2>
        The Queen Aruk<br />
        <span class="italic">Declaration.</span>
      </h2>
      <div class="rule"></div>
    </header>

    <div class="preamble">
      <p class="kicker">Preamble</p>
      <p>
        We, the African Queens and Royal Matriarchs of the continent and the
        Diaspora, assembled under the patronage of <em>Her Royal Highness
        Queen Marie Erete Obonganwan Aruk II</em>, affirm our sacred
        responsibility as custodians of land, culture, and intergenerational
        leadership.
      </p>
      <p>
        Grounded in ancestral wisdom and united by shared destiny, we convene
        at a time requiring <em>clarity, courage, and collective royal authority</em>.
      </p>
    </div>

    <ol class="articles">
      {#each articles as a}
        <li>
          <div class="art-head">
            <span class="art-num">Article {a.num}</span>
            <h3>{a.title}</h3>
          </div>
          <p>{a.body}</p>
        </li>
      {/each}
    </ol>

    <div class="closing">
      <p class="affirmation">
        Adopted in unity and sovereign resolve, this Declaration stands as the
        collective voice of African Queens to the global community.
      </p>
      <div class="sign">
        <span class="glyph">♕</span>
        <div class="sign-text">
          <div class="s1">Signed and Affirmed</div>
          <div class="s2">At the Queen Aruk Global Queens Summit</div>
          <div class="s3">United Kingdom · 2026</div>
        </div>
        <span class="glyph">♕</span>
      </div>
    </div>
  </div>
</section>

<style>
  .declaration {
    background: linear-gradient(180deg, #1d1610 0%, #0f0a06 100%);
    color: var(--cream);
    position: relative;
    overflow: hidden;
  }
  .declaration::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(224, 119, 77, 0.12), transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgba(166, 124, 61, 0.1), transparent 50%);
    pointer-events: none;
  }

  header {
    text-align: center;
    margin-bottom: 3.5rem;
    position: relative;
  }
  .rule {
    width: 120px;
    height: 1px;
    margin: 0 auto;
    background: linear-gradient(to right, transparent, var(--terracotta-bright), transparent);
  }
  header .eyebrow {
    color: var(--terracotta-bright);
    margin: 1.75rem 0;
    display: block;
  }
  h2 {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 400;
    line-height: 1;
    margin-bottom: 1.75rem;
    font-variation-settings: 'opsz' 144, 'SOFT' 20;
    color: var(--cream);
  }
  .italic { font-style: italic; color: var(--terracotta-bright); font-weight: 300; }

  .preamble {
    max-width: 640px;
    margin: 0 auto 4rem;
    position: relative;
  }
  .kicker {
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    text-align: center;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }
  .preamble p {
    font-family: var(--font-display);
    font-size: 1.25rem;
    line-height: 1.6;
    color: rgba(250, 246, 234, 0.88);
    margin-bottom: 1.25rem;
    text-align: center;
  }
  .preamble em {
    color: var(--terracotta-bright);
    font-style: italic;
    font-weight: 400;
  }

  .articles {
    list-style: none;
    margin-bottom: 4rem;
    counter-reset: none;
  }
  .articles li {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 2.5rem;
    padding: 2rem 0;
    border-top: 1px solid rgba(250, 246, 234, 0.12);
  }
  .articles li:last-child { border-bottom: 1px solid rgba(250, 246, 234, 0.12); }
  .art-head { padding-top: 0.2rem; }
  .art-num {
    display: block;
    font-family: var(--font-display);
    font-style: italic;
    font-size: 0.85rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    margin-bottom: 0.4rem;
    font-weight: 400;
  }
  .articles h3 {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--cream);
    line-height: 1.2;
  }
  .articles p {
    font-family: var(--font-display);
    font-size: 1.1rem;
    line-height: 1.6;
    color: rgba(250, 246, 234, 0.82);
  }

  .closing {
    text-align: center;
    max-width: 640px;
    margin: 0 auto;
  }
  .affirmation {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1.2rem;
    line-height: 1.55;
    color: var(--terracotta-bright);
    margin-bottom: 2.5rem;
    padding: 0 1rem;
  }

  .sign {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 2rem 0;
    border-top: 1px solid rgba(250, 246, 234, 0.15);
    border-bottom: 1px solid rgba(250, 246, 234, 0.15);
  }
  .glyph {
    font-size: 1.8rem;
    color: var(--terracotta-bright);
  }
  .sign-text { text-align: center; }
  .s1 {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--cream);
    font-size: 1.15rem;
    margin-bottom: 0.25rem;
  }
  .s2 {
    font-size: 0.82rem;
    color: rgba(250, 246, 234, 0.75);
    margin-bottom: 0.2rem;
  }
  .s3 {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    font-weight: 500;
  }

  @media (max-width: 720px) {
    .articles li { grid-template-columns: 1fr; gap: 0.75rem; }
    .art-head { padding-top: 0; }
  }
</style>
