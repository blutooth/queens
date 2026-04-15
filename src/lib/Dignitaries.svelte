<script>
  import { dignitaries } from './queens.js';

  function initials(name) {
    return name
      .replace(/^(The|His|Her|Dr|Chief|Sir|Lady)\s+/i, '')
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
</script>

<section id="dignitaries" class="dignitaries">
  <div class="container">
    <header>
      <p class="eyebrow">In Attendance</p>
      <h2>
        The royal<br />
        <span class="italic">houses gather.</span>
      </h2>
      <p class="sub">
        A convocation of queens, kings, and traditional rulers from across Africa
        and the Diaspora. Confirmed and invited attendees include —
      </p>
    </header>

    <div class="list">
      {#each dignitaries as d, i}
        <div class="row">
          <div class="num">{String(i + 1).padStart(2, '0')}</div>
          <div class="seal">{initials(d.name)}</div>
          <div class="names">
            <div class="hrm">{d.honorific}</div>
            <div class="nm">{d.name}</div>
          </div>
          <div class="role">
            <div class="r">{d.role}</div>
            <div class="rg">{d.region}</div>
          </div>
          <div class="status-col">
            <span class="status" class:confirmed={d.status === 'Confirmed'} class:convener={d.status === 'Convener'}>
              {d.status}
            </span>
          </div>
        </div>
      {/each}
    </div>

    <p class="footnote">
      Additional royal houses are finalising their delegations.
      The official list of attendees will be published in the summit programme.
    </p>
  </div>
</section>

<style>
  .dignitaries {
    background: var(--paper-soft);
  }

  header {
    max-width: 720px;
    margin: 0 auto 4rem;
    text-align: center;
  }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin: 1rem 0 1.25rem;
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .sub {
    color: var(--ink-soft);
    font-size: 1.05rem;
    line-height: 1.55;
    max-width: 580px;
    margin: 0 auto;
  }

  .list {
    max-width: 1000px;
    margin: 0 auto 3rem;
  }
  .row {
    display: grid;
    grid-template-columns: 40px 50px 1fr 1fr auto;
    gap: 1.25rem;
    align-items: center;
    padding: 1.25rem 0.5rem;
    border-top: 1px solid var(--line);
    transition: background 0.25s ease, padding 0.25s ease;
  }
  .row:last-child { border-bottom: 1px solid var(--line); }
  .row:hover {
    background: var(--paper);
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .num {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--terracotta);
    font-size: 0.95rem;
  }
  .seal {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--terracotta-bright);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  .hrm {
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.2rem;
  }
  .nm {
    font-family: var(--font-display);
    font-size: 1.15rem;
    color: var(--ink);
    line-height: 1.15;
  }
  .r {
    font-size: 0.92rem;
    color: var(--ink);
  }
  .rg {
    font-size: 0.75rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    margin-top: 0.2rem;
  }
  .status {
    display: inline-block;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    padding: 0.35rem 0.7rem;
    border: 1px solid var(--line-strong);
    color: var(--muted);
    border-radius: 999px;
    font-weight: 500;
    background: var(--paper);
  }
  .status.confirmed {
    color: var(--forest);
    border-color: var(--forest);
  }
  .status.convener {
    background: var(--terracotta-bright);
    border-color: var(--terracotta-bright);
    color: var(--ink);
  }

  .footnote {
    text-align: center;
    max-width: 640px;
    margin: 0 auto;
    color: var(--muted);
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1rem;
    line-height: 1.5;
  }

  @media (max-width: 760px) {
    .row {
      grid-template-columns: 44px 1fr auto;
      grid-template-rows: auto auto;
      gap: 0.75rem 1rem;
    }
    .num { display: none; }
    .seal { grid-row: span 2; }
    .names { grid-column: 2; }
    .role { grid-column: 2; font-size: 0.88rem; }
    .status-col { grid-column: 3; grid-row: 1 / span 2; align-self: center; }
  }
</style>
