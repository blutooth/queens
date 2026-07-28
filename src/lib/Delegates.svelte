<script>
  import { delegates } from './queens.js';
</script>

<section id="delegates" class="delegates">
  <div class="container">
    <header>
      <p class="eyebrow">Registered &amp; confirmed</p>
      <h2>
        Our confirmed<br />
        <span class="italic">delegates.</span>
      </h2>
      <p class="lead">
        We warmly welcome the distinguished participants who have confirmed
        their attendance at the African Queens Summit 2026.
      </p>
    </header>

    <ul class="grid">
      {#each delegates as name}
        <li>{name}</li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .delegates {
    background: var(--cream);
    color: var(--forest);
  }
  header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 3.5rem;
  }
  header .eyebrow {
    color: var(--terracotta-bright, #c0562f);
  }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin-top: 1rem;
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta-bright, #c0562f); font-weight: 300; }
  .lead {
    margin-top: 1.25rem;
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.15rem;
    line-height: 1.6;
    color: rgba(20, 40, 30, 0.8);
  }
  .grid {
    list-style: none;
    margin: 0 auto;
    padding: 0;
    max-width: 960px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.25rem 1.5rem;
  }
  .grid li {
    padding: 0.85rem 0.5rem;
    border-bottom: 1px solid rgba(20, 60, 45, 0.14);
    font-size: 1.02rem;
    letter-spacing: 0.01em;
  }
  @media (max-width: 520px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
