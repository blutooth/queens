<script>
  import { team } from './queens.js';

  function initials(name) {
    const parts = name
      .replace(/^((Ms|Mrs|Mr|Dr|Chief|Madame|Mme)\s+)+/i, '')
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return '★';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (parts[0][0] + last).toUpperCase();
  }
</script>

<section id="secretariat" class="secretariat">
  <div class="container">
    <header>
      <p class="eyebrow">Behind the Ceremony</p>
      <h2>Secretariat<br /><span class="italic">&amp; protocol.</span></h2>
      <p class="lead">
        The team who receive our sovereigns and distinguished guests — stewarding
        courtesy, ceremony and hospitality throughout the Summit.
      </p>
    </header>

    <div class="grid" class:solo={team.length === 1}>
      {#each team as m}
        <article class="member">
          <div class="portrait">
            {#if m.images && m.images[0]}
              <img src={m.images[0]} alt={m.name} loading="lazy"
                   style={m.objectPosition ? 'object-position: ' + m.objectPosition : ''} />
            {:else}
              <div class="ph" aria-hidden="true"><span>{initials(m.name)}</span></div>
            {/if}
          </div>
          <div class="detail">
            <p class="who">{m.title}{#if m.region} · {m.region}{/if}</p>
            <h3>{m.name}</h3>
            {#if m.role}<p class="role">{m.role}</p>{/if}
            <div class="bio">
              {#each m.bio as para}
                <p>{para}</p>
              {/each}
            </div>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .secretariat {
    background: var(--paper, #f7f1e3);
    color: var(--ink, #241a12);
  }
  header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 3.5rem;
  }
  header .eyebrow { color: var(--terracotta-bright, #c15b34); }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin-top: 1rem;
    line-height: 1.05;
    color: var(--ink);
  }
  .italic { font-style: italic; color: var(--terracotta-bright, #c15b34); font-weight: 300; }
  .lead {
    margin-top: 1.25rem;
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.15rem;
    line-height: 1.6;
    color: rgba(36, 26, 18, 0.78);
  }

  .grid { display: grid; gap: 3rem; }
  /* When just one team member, present as a refined feature row */
  .member {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2.5rem;
    align-items: center;
    max-width: 900px;
    margin: 0 auto;
    background: var(--sand, #fbf6ea);
    border: 1px solid var(--line, rgba(193, 91, 52, 0.25));
    border-radius: 10px;
    padding: 2rem;
  }

  .portrait { position: relative; }
  .portrait > img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid rgba(212, 175, 55, 0.5);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
    display: block;
  }
  .portrait .ph {
    width: 100%;
    aspect-ratio: 4 / 5;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.25), transparent 60%),
      linear-gradient(160deg, rgba(13, 107, 79, 0.5), rgba(9, 59, 44, 0.85));
  }
  .portrait .ph span {
    font-family: var(--font-display, Georgia, serif);
    font-size: clamp(2.6rem, 7vw, 4rem);
    letter-spacing: 0.08em;
    color: var(--gold, #d4af37);
  }

  .detail .who {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--terracotta-bright, #c15b34);
    margin: 0 0 0.5rem;
  }
  h3 {
    font-size: clamp(1.6rem, 3.4vw, 2.3rem);
    font-weight: 400;
    line-height: 1.1;
    margin: 0;
    color: var(--ink);
  }
  .detail .role {
    font-family: var(--font-display, Georgia, serif);
    font-style: italic;
    color: rgba(36, 26, 18, 0.72);
    font-size: 1.05rem;
    margin: 0.5rem 0 1.25rem;
  }
  .bio p {
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(36, 26, 18, 0.82);
    margin: 0 0 0.9rem;
  }

  /* Multiple members → responsive card grid */
  .grid:not(.solo) { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); max-width: 1080px; margin: 0 auto; }
  .grid:not(.solo) .member {
    grid-template-columns: 1fr;
    text-align: center;
    max-width: none;
  }
  .grid:not(.solo) .portrait { max-width: 200px; margin: 0 auto; }

  @media (max-width: 720px) {
    .member { grid-template-columns: 1fr; gap: 1.75rem; text-align: center; }
    .portrait { max-width: 260px; margin: 0 auto; }
    .bio p { text-align: left; }
  }
</style>
