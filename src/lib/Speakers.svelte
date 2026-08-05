<script>
  import { speakers } from './queens.js';

  function initials(name) {
    const parts = name
      .replace(/^((Olori|Queen|Mother|Naa|HRH|HRM|HRM\.|Oba|King|Prince|Princess|Chief|Dr|Mr|Mrs|Ms)\s+)+/i, '')
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return '★';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (parts[0][0] + last).toUpperCase();
  }
</script>

<section id="speakers" class="speakers">
  <div class="container">
    <header>
      <p class="eyebrow">Voices at the Summit</p>
      <h2>
        Distinguished<br />
        <span class="italic">speakers.</span>
      </h2>
      <p class="lead">
        Leaders, custodians of heritage, and changemakers who will address the
        African Global Queens Summit 2026.
      </p>
    </header>

    <div class="list">
      {#each speakers as s, i}
        <article class="speaker" class:reverse={i % 2 === 1}>
          <div class="portrait">
            {#if s.images[0]}
              <img src={s.images[0]} alt={s.name} loading="lazy" style={s.objectPosition ? 'object-position: ' + s.objectPosition : ''} />
              {#if s.images[1]}
                <img class="inset" src={s.images[1]} alt={s.name} loading="lazy" style={s.insetPosition ? 'object-position: ' + s.insetPosition : ''} />
              {/if}
            {:else}
              <div class="ph" aria-hidden="true"><span>{initials(s.name)}</span></div>
            {/if}
          </div>
          <div class="detail">
            <p class="who">{s.title}{#if s.region} · {s.region}{/if}</p>
            <h3>{s.name}</h3>
            {#if s.role}<p class="role">{s.role}</p>{/if}
            <div class="bio">
              {#each s.bio as para}
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
  .speakers {
    background: var(--forest);
    color: var(--cream);
  }
  header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 4rem;
  }
  header .eyebrow { color: var(--terracotta-bright, #e0774d); }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin-top: 1rem;
    line-height: 1.05;
    color: var(--cream);
  }
  .italic { font-style: italic; color: var(--terracotta-bright, #e0774d); font-weight: 300; }
  .lead {
    margin-top: 1.25rem;
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.15rem;
    line-height: 1.6;
    color: rgba(250, 246, 234, 0.85);
  }

  .list { display: flex; flex-direction: column; gap: 4rem; }
  .speaker {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 2.5rem;
    align-items: center;
    max-width: 980px;
    margin: 0 auto;
  }
  .speaker.reverse { grid-template-columns: 1fr 340px; }
  .speaker.reverse .portrait { order: 2; }

  .portrait { position: relative; }
  .portrait > img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid rgba(212, 175, 55, 0.4);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    display: block;
  }
  .portrait .inset {
    position: absolute;
    right: -18px;
    bottom: -18px;
    width: 42%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border-radius: 5px;
    border: 2px solid var(--forest);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  }
  .portrait .ph {
    width: 100%;
    aspect-ratio: 4 / 5;
    border-radius: 6px;
    border: 1px solid rgba(212, 175, 55, 0.4);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.22), transparent 60%),
      linear-gradient(160deg, rgba(13, 107, 79, 0.55), rgba(9, 59, 44, 0.9));
  }
  .portrait .ph span {
    font-family: var(--font-display, Georgia, serif);
    font-size: clamp(3rem, 8vw, 5rem);
    letter-spacing: 0.08em;
    color: var(--gold, #d4af37);
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.5);
  }

  .detail .who {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--terracotta-bright, #e0774d);
    margin: 0 0 0.5rem;
  }
  h3 {
    font-size: clamp(1.6rem, 3.4vw, 2.4rem);
    font-weight: 400;
    line-height: 1.1;
    margin: 0;
    color: var(--cream);
  }
  .detail .role {
    font-family: var(--font-display, Georgia, serif);
    font-style: italic;
    color: rgba(250, 246, 234, 0.9);
    font-size: 1.05rem;
    margin: 0.5rem 0 1.25rem;
  }
  .bio p {
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(250, 246, 234, 0.82);
    margin: 0 0 0.9rem;
  }

  @media (max-width: 720px) {
    .speaker, .speaker.reverse { grid-template-columns: 1fr; gap: 2.5rem; }
    .speaker.reverse .portrait { order: 0; }
    .portrait { max-width: 300px; margin: 0 auto; }
    .portrait .inset { width: 38%; right: -10px; bottom: -10px; }
  }
</style>
