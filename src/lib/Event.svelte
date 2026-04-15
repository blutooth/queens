<section id="event" class="event">
  <div class="container grid">
    <div class="text">
      <p class="eyebrow">The Evening</p>
      <h2>An evening <em>crowned</em> in story, music, and memory.</h2>
      <p>
        For one night, The Atrium becomes a palace. Scholars, artists, chefs, and
        griots come together to tell the stories of eight queens whose decisions
        echo still — in the lands they ruled, in the descendants they shaped,
        and in every woman who carries their name.
      </p>
      <p>
        You will not simply attend. You will be welcomed into a living tribute:
        a procession of dance, a hall of spoken word, a feast drawn from the
        courts and kitchens of ancestral Africa.
      </p>

      <ul class="points">
        <li><span>◈</span> A four-course dinner from eight culinary traditions</li>
        <li><span>◈</span> Live percussion, kora, and vocal performance</li>
        <li><span>◈</span> Keynote from Dr. Aminata Koné, Columbia University</li>
        <li><span>◈</span> Curated marketplace of West & East African artisans</li>
      </ul>
    </div>

    <aside class="card">
      <div class="ribbon">Est. 2026</div>
      <h3>The Atrium</h3>
      <p class="addr">
        411 W 56th Street<br />
        New York, NY 10019
      </p>
      <div class="stats">
        <div>
          <div class="n">180</div>
          <div class="l">Guests</div>
        </div>
        <div>
          <div class="n">8</div>
          <div class="l">Queens</div>
        </div>
        <div>
          <div class="n">4</div>
          <div class="l">Hours</div>
        </div>
      </div>
      <p class="fine">
        A portion of every ticket supports the Queen Nzinga Scholarship Fund
        for young women pursuing African studies.
      </p>
    </aside>
  </div>
</section>

<style>
  .event {
    background:
      linear-gradient(180deg, transparent 0%, rgba(196, 98, 58, 0.04) 50%, transparent 100%),
      var(--bg);
    position: relative;
  }
  .event::before, .event::after {
    content: '';
    position: absolute;
    left: 50%;
    width: 60%;
    max-width: 300px;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    transform: translateX(-50%);
  }
  .event::before { top: 0; }
  .event::after { bottom: 0; }

  .grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 5rem;
    align-items: center;
  }

  h2 {
    font-size: clamp(2rem, 4.5vw, 3.25rem);
    margin: 1rem 0 2rem;
    max-width: 18ch;
  }
  h2 em {
    color: var(--gold-bright);
    font-style: italic;
    font-weight: 400;
  }

  .text p {
    color: var(--muted);
    font-size: 1.05rem;
    margin-bottom: 1.25rem;
    max-width: 58ch;
  }

  .points {
    list-style: none;
    margin-top: 2rem;
  }
  .points li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(212, 162, 76, 0.1);
    color: var(--ivory);
  }
  .points span { color: var(--gold); }

  .card {
    position: relative;
    padding: 3rem 2.5rem;
    background:
      radial-gradient(circle at 30% 0%, rgba(212, 162, 76, 0.15), transparent 60%),
      linear-gradient(160deg, var(--surface), var(--deep));
    border: 1px solid rgba(212, 162, 76, 0.3);
    text-align: center;
  }
  .ribbon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    color: var(--gold);
    text-transform: uppercase;
  }
  .card h3 {
    font-size: 2.25rem;
    margin-bottom: 0.5rem;
  }
  .addr {
    font-family: var(--font-serif);
    color: var(--muted);
    font-size: 1.05rem;
    margin-bottom: 2rem;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 1.5rem 0;
    border-top: 1px solid rgba(212, 162, 76, 0.2);
    border-bottom: 1px solid rgba(212, 162, 76, 0.2);
    margin-bottom: 2rem;
  }
  .n {
    font-family: var(--font-serif);
    font-size: 2.25rem;
    color: var(--gold-bright);
  }
  .l {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .fine {
    font-size: 0.85rem;
    font-style: italic;
    font-family: var(--font-serif);
    color: var(--muted);
    line-height: 1.5;
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; gap: 3rem; }
  }
</style>
