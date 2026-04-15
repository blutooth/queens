<script>
  import { partners } from './queens.js';
</script>

<section id="partners" class="partners">
  <div class="container">
    <header>
      <p class="eyebrow">Convened in collaboration with</p>
      <h2>
        A movement built<br />
        on <span class="italic">partnership.</span>
      </h2>
    </header>

    <div class="list">
      {#each partners as p, i}
        <div class="row" class:featured={p.featured}>
          <div class="rank">No. {String(i + 1).padStart(2, '0')}</div>
          <div class="name-col">
            <h3>
              {p.name}
              {#if p.featured}<span class="badge">◈ In partnership</span>{/if}
            </h3>
          </div>
          <div class="role">{p.role}</div>
        </div>
      {/each}
    </div>

    <p class="horizon">
      <span class="italic">Following England,</span> the movement continues across
      the Caribbean and the nations of Africa — a sustained convocation for
      generations to come.
    </p>
  </div>
</section>

<style>
  .partners {
    background: var(--forest);
    color: var(--cream);
  }

  header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 4.5rem;
  }
  header .eyebrow {
    color: var(--terracotta-bright);
  }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin-top: 1rem;
    color: var(--cream);
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta-bright); font-weight: 300; }

  .list {
    max-width: 900px;
    margin: 0 auto 4rem;
  }
  .row {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 2rem;
    align-items: center;
    padding: 1.5rem 0;
    border-top: 1px solid rgba(250, 246, 234, 0.15);
  }
  .row:last-child { border-bottom: 1px solid rgba(250, 246, 234, 0.15); }
  .row.featured {
    background: rgba(224, 119, 77, 0.08);
    padding-left: 1rem;
    padding-right: 1rem;
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 2px;
  }
  .badge {
    display: inline-block;
    margin-left: 0.75rem;
    font-family: var(--font-sans);
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    vertical-align: middle;
    font-weight: 500;
  }

  .rank {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--terracotta-bright);
    font-size: 0.95rem;
    letter-spacing: 0.05em;
  }
  h3 {
    font-size: clamp(1.35rem, 2.8vw, 2rem);
    color: var(--cream);
    font-weight: 400;
    line-height: 1.15;
  }
  .role {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(250, 246, 234, 0.65);
  }

  .horizon {
    text-align: center;
    max-width: 640px;
    margin: 0 auto;
    font-family: var(--font-display);
    font-size: 1.25rem;
    line-height: 1.55;
    color: rgba(250, 246, 234, 0.9);
  }

  @media (max-width: 620px) {
    .row { grid-template-columns: 1fr; gap: 0.5rem; }
    .role { justify-self: start; }
  }
</style>
