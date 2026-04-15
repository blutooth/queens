<script>
  const draws = [
    {
      num: '01',
      title: 'Inspiring Speakers',
      body: 'Keynotes and royal lectures from queens, scholars, and humanitarians whose lives bridge tradition and statecraft.',
      icon: 'mic',
    },
    {
      num: '02',
      title: 'Networking Events',
      body: 'Private salons, royal dinners, and the Queens\' Roundtables — forging bonds between royal houses, institutions, and allies.',
      icon: 'link',
    },
    {
      num: '03',
      title: 'Royal Ceremonies',
      body: 'Processions, libations, and honours — a Royal Gala at Porchester Hall and a cultural finale at the Notting Hill Carnival.',
      icon: 'crown',
    },
  ];
</script>

<section id="summit" class="summit">
  <div class="container">
    <div class="intro">
      <p class="eyebrow">Why attend</p>
      <h2>
        Three draws.<br />
        One <span class="italic">convocation.</span>
      </h2>
      <p class="lede">
        Eighteen days of inspiring speakers, royal networking, and ceremonial
        grandeur — a historic convening of African queenship in London and Oxford.
      </p>
    </div>

    <div class="draws">
      {#each draws as d, i}
        <article class="draw" class:mid={i === 1}>
          <div class="icon">
            {#if d.icon === 'mic'}
              <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
                <path d="M24 6c-3.3 0-6 2.7-6 6v14c0 3.3 2.7 6 6 6s6-2.7 6-6V12c0-3.3-2.7-6-6-6z" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <path d="M12 24a12 12 0 0 0 24 0M24 36v6M18 42h12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            {:else if d.icon === 'link'}
              <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
                <circle cx="16" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <circle cx="32" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <circle cx="32" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <path d="M21.5 21L27 17M21.5 27L27 31" fill="none" stroke="currentColor" stroke-width="1.3"/>
              </svg>
            {:else if d.icon === 'crown'}
              <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
                <path d="M8 34l2-16 8 8 6-12 6 12 8-8 2 16z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                <path d="M8 34h32" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                <circle cx="10" cy="18" r="1.2" fill="currentColor"/>
                <circle cx="24" cy="6" r="1.4" fill="currentColor"/>
                <circle cx="38" cy="18" r="1.2" fill="currentColor"/>
              </svg>
            {/if}
          </div>
          <div class="num">{d.num}</div>
          <h3>{d.title}</h3>
          <p>{d.body}</p>
        </article>
      {/each}
    </div>

    <div class="rule-row">
      <span class="bar"></span>
      <span class="tag">14 – 31 August 2026 · London &amp; Oxford · 100 queens</span>
      <span class="bar"></span>
    </div>
  </div>
</section>

<style>
  .summit {
    background: var(--paper);
  }

  .intro {
    max-width: 760px;
    margin: 0 auto 4.5rem;
    text-align: center;
  }
  h2 {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    margin: 1rem 0 1.5rem;
    color: var(--ink);
    line-height: 1;
    font-weight: 400;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .lede {
    font-size: 1.15rem;
    color: var(--ink-soft);
    line-height: 1.6;
    max-width: 620px;
    margin: 0 auto;
  }

  .draws {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 4rem;
  }

  .draw {
    padding: 3rem 2rem 2.5rem;
    background: var(--paper-soft);
    border-radius: 4px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .draw.mid {
    background: var(--ink);
    color: var(--cream);
    transform: translateY(-12px);
  }
  .draw:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 48px -20px rgba(35, 28, 21, 0.22);
  }
  .draw.mid:hover {
    transform: translateY(-16px);
    box-shadow: 0 30px 60px -20px rgba(35, 28, 21, 0.5);
  }

  .icon {
    color: var(--terracotta);
    margin-bottom: 1.75rem;
  }
  .draw.mid .icon { color: var(--terracotta-bright); }

  .num {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 0.9rem;
    letter-spacing: 0.15em;
    color: var(--muted);
    margin-bottom: 0.75rem;
  }
  .draw.mid .num { color: rgba(250, 246, 234, 0.6); }

  .draw h3 {
    font-size: clamp(1.85rem, 2.8vw, 2.25rem);
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 1rem;
    color: var(--ink);
  }
  .draw.mid h3 { color: var(--cream); }

  .draw p {
    color: var(--ink-soft);
    font-size: 0.98rem;
    line-height: 1.6;
  }
  .draw.mid p { color: rgba(250, 246, 234, 0.82); }

  .rule-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    max-width: 960px;
    margin: 0 auto;
  }
  .bar {
    flex: 1;
    height: 1px;
    background: var(--line);
  }
  .tag {
    font-size: 0.75rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--terracotta);
    font-weight: 500;
    white-space: nowrap;
  }

  @media (max-width: 880px) {
    .draws { grid-template-columns: 1fr; }
    .draw.mid { transform: none; }
    .draw.mid:hover { transform: translateY(-4px); }
    .rule-row { flex-direction: column; gap: 1rem; }
    .tag { white-space: normal; text-align: center; }
  }
</style>
