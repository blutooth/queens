<script>
  import { asset } from './asset.js';
  import { onMount } from 'svelte';

  export let source = '';

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

  function parse(src) {
    let body = src.replace(/^---\n[\s\S]*?\n---\n/, '');
    return body.split(/\n-{3,}\n/).map((raw) => {
      const s = { images: [], kicker: '', title: '', subtitle: '', bullets: [], paras: [], cover: false, accent: 'gold' };
      for (const line of raw.split('\n')) {
        const t = line.trim();
        if (!t) continue;
        let m;
        if (/<!--\s*cover\s*-->/.test(t)) { s.cover = true; continue; }
        if ((m = t.match(/<!--\s*accent:\s*(\w+)\s*-->/))) { s.accent = m[1]; continue; }
        if ((m = t.match(/^!\[[^\]]*\]\(([^)]+)\)/))) { s.images.push(m[1]); continue; }
        if ((m = t.match(/^>\s+(.*)/))) { s.kicker = m[1]; continue; }
        if ((m = t.match(/^##\s+(.*)/))) { s.subtitle = m[1]; continue; }
        if ((m = t.match(/^#\s+(.*)/))) { s.title = m[1]; continue; }
        if ((m = t.match(/^-\s+(.*)/))) { s.bullets.push(m[1]); continue; }
        s.paras.push(t);
      }
      return s;
    }).filter((s) => s.images.length || s.title || s.bullets.length || s.paras.length);
  }

  $: slides = parse(source);
  let current = 0;
  let container;

  const go = (i) => container?.children[Math.max(0, Math.min(slides.length - 1, i))]?.scrollIntoView({ behavior: 'smooth' });
  function onKey(e) {
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(current + 1); }
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
  }
  onMount(() => {
    const io = new IntersectionObserver(
      (ents) => ents.forEach((en) => { if (en.isIntersecting) current = Number(en.target.dataset.i); }),
      { threshold: 0.55 },
    );
    Array.from(container.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  });
</script>

<svelte:window on:keydown={onKey} />

<div class="deck" bind:this={container}>
  {#each slides as s, i}
    {@const bg = s.cover && s.images.length}
    <section class="slide accent-{s.accent}" class:cover={s.cover} data-i={i}>
      <div
        class="frame"
        class:coverbg={bg}
        style={bg ? `background-image: linear-gradient(180deg, rgba(8,8,8,0.55), rgba(8,8,8,0.82)), url(${asset(s.images[0])})` : ''}
      >
        <div class="topbar">
          <span class="brand">African Queens Summit <span class="sep">·</span> England 2026</span>
          <span class="pg">{String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
        </div>

        <div class="body" class:split={s.images.length === 1 && !s.cover}>
          <div class="text">
            {#if s.kicker}<p class="kicker">{@html inline(s.kicker)}</p>{/if}
            {#if s.title}<h2>{@html inline(s.title)}</h2>{/if}
            {#if s.subtitle}<p class="subtitle">{@html inline(s.subtitle)}</p>{/if}
            {#if s.bullets.length}<ul>{#each s.bullets as b}<li>{@html inline(b)}</li>{/each}</ul>{/if}
            {#each s.paras as p}<p class="para">{@html inline(p)}</p>{/each}
          </div>

          {#if s.images.length && !s.cover}
            <div class="media" class:grid={s.images.length > 1} class:single={s.images.length === 1} style="--n:{Math.min(s.images.length, 3)}">
              {#each s.images.slice(0, 6) as img}<figure><img src={asset(img)} alt="" loading="lazy" /></figure>{/each}
            </div>
          {/if}
        </div>

        <div class="rule"></div>
      </div>
    </section>
  {/each}
</div>

<nav class="dots" aria-label="Slides">
  {#each slides as _, i}<button class:on={i === current} on:click={() => go(i)} aria-label={`Slide ${i + 1}`}></button>{/each}
</nav>
<div class="hint">↓ scroll · ← → arrows · ⌘P to export PDF</div>

<style>
  :global(html, body) { margin: 0; background: #080808; }

  .deck { height: 100vh; overflow-y: scroll; scroll-snap-type: y proximity; scroll-behavior: smooth; }
  .deck::-webkit-scrollbar { display: none; }

  .slide {
    min-height: 100vh; scroll-snap-align: start;
    display: flex; align-items: stretch; justify-content: center;
    padding: clamp(0.8rem, 2.4vw, 1.8rem);
    background: #080808;
  }
  .frame {
    width: 100%; max-width: 1280px;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
    padding: clamp(1.6rem, 4vw, 3.6rem);
    display: flex; flex-direction: column; color: #f5f2ea; overflow: hidden;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0) 40%), #100f0e;
  }
  .frame.coverbg { background-size: cover; background-position: center; border-color: rgba(255,255,255,0.14); }

  .topbar {
    display: flex; justify-content: space-between; align-items: center;
    font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.18em;
    font-size: 0.62rem; font-weight: 600; color: #706c62;
  }
  .frame.coverbg .topbar { color: rgba(255,255,255,0.7); }
  .topbar .brand { color: var(--k); }
  .frame.coverbg .topbar .brand { color: #fff; }
  .topbar .sep { opacity: 0.5; }

  .body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: clamp(0.8rem, 1.8vw, 1.4rem) 0; }
  .body.split { display: grid; grid-template-columns: 1fr 1.15fr; gap: clamp(1.6rem, 4vw, 3.8rem); align-items: center; }
  @media (max-width: 820px) { .body.split { grid-template-columns: 1fr; } }

  .cover .body { text-align: center; align-items: center; }
  .cover .text { max-width: 900px; }

  .kicker {
    font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.24em;
    font-size: clamp(0.6rem, 1.3vw, 0.8rem); font-weight: 600; color: var(--k); margin: 0 0 1.1rem;
  }
  .cover .kicker { color: #e6c98a; }
  h2 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 340;
    font-size: clamp(1.9rem, 4.8vw, 3.6rem); line-height: 1.03; letter-spacing: -0.015em;
    margin: 0; color: #fdfbf5;
  }
  .cover h2 { font-size: clamp(2.3rem, 7vw, 5rem); text-shadow: 0 2px 30px rgba(0,0,0,0.5); }
  .subtitle {
    font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 300;
    font-size: clamp(1.05rem, 2.4vw, 1.7rem); color: rgba(245,242,234,0.78); margin: 1.1rem 0 0; max-width: 48ch;
  }
  .cover .subtitle { margin-left: auto; margin-right: auto; color: rgba(255,255,255,0.9); }

  ul { list-style: none; padding: 0; margin: 1.9rem 0 0; display: grid; gap: 0; }
  li {
    font-family: 'Inter', sans-serif; font-size: clamp(1rem, 1.9vw, 1.32rem);
    padding: 0.9rem 0 0.9rem 1.9rem; position: relative; color: rgba(245,242,234,0.6);
    line-height: 1.35; border-top: 1px solid rgba(255,255,255,0.09);
  }
  li:last-child { border-bottom: 1px solid rgba(255,255,255,0.09); }
  li::before { content: ''; position: absolute; left: 0; top: 1.4em; width: 9px; height: 9px; border-radius: 2px; background: var(--k); transform: rotate(45deg); }
  li :global(strong) { color: #fdfbf5; font-weight: 600; }
  .para {
    font-family: 'Inter', sans-serif; font-size: clamp(1rem, 1.85vw, 1.26rem);
    line-height: 1.6; color: rgba(245,242,234,0.74); margin: 1.2rem 0 0; max-width: 56ch;
  }
  .para :global(em) { color: var(--k); font-style: italic; }
  .cover .para { margin-left: auto; margin-right: auto; }

  /* image cards — big and bold */
  .media.single figure { margin: 0; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 26px 60px rgba(0,0,0,0.6); }
  .media.single img { width: 100%; height: clamp(260px, 56vh, 560px); object-fit: cover; display: block; }
  .media.grid { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 16px; margin-top: 2.1rem; }
  @media (max-width: 820px) { .media.grid { grid-template-columns: repeat(2, 1fr); } }
  .media.grid figure { margin: 0; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 16px 38px rgba(0,0,0,0.55); }
  .media.grid img { width: 100%; height: clamp(200px, 32vh, 340px); object-fit: cover; display: block; }

  .rule { height: 3px; width: 72px; background: var(--k); border-radius: 2px; margin-top: auto; }
  .cover .rule { margin-left: auto; margin-right: auto; background: #e6c98a; }

  .accent-gold { --k: #d4a95d; }
  .accent-terracotta { --k: #e0774d; }
  .accent-forest { --k: #7cb492; }

  .dots {
    position: fixed; right: clamp(0.6rem, 1.5vw, 1.2rem); top: 50%; transform: translateY(-50%);
    display: flex; flex-direction: column; gap: 9px; z-index: 5;
  }
  .dots button { width: 9px; height: 9px; border-radius: 50%; padding: 0; cursor: pointer; border: 1px solid rgba(255,255,255,0.4); background: transparent; transition: all 0.2s; }
  .dots button.on { background: #d4a95d; border-color: #d4a95d; transform: scale(1.3); }

  .hint {
    position: fixed; left: 50%; transform: translateX(-50%); bottom: 0.7rem;
    color: rgba(245,242,234,0.4); font-size: 0.68rem; letter-spacing: 0.08em; z-index: 5; font-family: 'Inter', sans-serif;
  }

  @media print {
    :global(html, body), .slide { background: #080808; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .deck { height: auto; overflow: visible; }
    .slide { height: 100vh; page-break-after: always; padding: 0; }
    .frame { border: none; border-radius: 0; max-width: none; height: 100%; }
    .dots, .hint { display: none; }
  }
</style>
