<script>
  import { onMount } from 'svelte';
  let scrolled = false;
  let open = false;

  onMount(() => {
    const onScroll = () => (scrolled = window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<nav class:scrolled>
  <div class="container row">
    <a href="#top" class="mark">
      <svg class="logo" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="1" />
        <path d="M12 24 L14 16 L18 22 L20 14 L22 22 L26 16 L28 24 Z" fill="currentColor" />
      </svg>
      <span class="wordmark">
        <span class="primary">African Queens Summit</span>
        <span class="sub">England · 2026</span>
      </span>
    </a>
    <button class="toggle" on:click={() => (open = !open)} aria-label="Menu">
      <span class:open></span>
      <span class:open></span>
    </button>
    <ul class:open>
      <li><a href="#programme" on:click={() => (open = false)}>Programme</a></li>
      <li><a href="#lineage" on:click={() => (open = false)}>Lineage</a></li>
      <li><a href="#dignitaries" on:click={() => (open = false)}>Attendees</a></li>
      <li><a href="#venue" on:click={() => (open = false)}>Venues</a></li>
      <li><a href="#pricing" on:click={() => (open = false)}>Pricing</a></li>
      <li><a href="#rsvp" class="cta" on:click={() => (open = false)}>RSVP</a></li>
    </ul>
  </div>
</nav>

<style>
  nav {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 50;
    padding: 1.25rem 0;
    transition: background 0.25s ease, padding 0.25s ease, box-shadow 0.25s ease;
  }
  nav.scrolled {
    background: rgba(247, 241, 227, 0.92);
    backdrop-filter: blur(12px);
    padding: 0.75rem 0;
    box-shadow: 0 1px 0 var(--line);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }
  .mark {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    color: var(--terracotta-bright);
  }
  .logo { width: 32px; height: 32px; color: var(--terracotta-bright); }
  .wordmark { display: flex; flex-direction: column; line-height: 1.1; }
  .primary {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: var(--terracotta-bright);
  }
  .sub {
    font-size: 0.62rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    opacity: 0.75;
    margin-top: 2px;
  }
  ul {
    list-style: none;
    display: flex;
    gap: 2rem;
    align-items: center;
  }
  ul a {
    color: var(--terracotta-bright);
    font-size: 0.88rem;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  ul a:hover { color: var(--cream); }
  nav.scrolled ul a:hover { color: var(--ink); }
  .cta {
    background: var(--terracotta-bright);
    color: var(--ink) !important;
    padding: 0.7rem 1.3rem;
    border-radius: 999px;
    transition: all 0.2s ease;
    font-weight: 600 !important;
  }
  .cta:hover {
    background: var(--cream);
    color: var(--ink) !important;
  }

  .toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: 0.5rem;
  }
  .toggle span {
    display: block;
    width: 24px;
    height: 1.5px;
    background: var(--terracotta-bright);
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .toggle span.open:nth-child(1) { transform: translateY(3.25px) rotate(45deg); }
  .toggle span.open:nth-child(2) { transform: translateY(-3.25px) rotate(-45deg); }

  @media (max-width: 900px) {
    .toggle { display: flex; }
    ul {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      gap: 0;
      background: var(--paper);
      box-shadow: 0 1px 0 var(--line);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    ul.open { max-height: 500px; }
    ul li { width: 100%; }
    ul a {
      display: block;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--line);
    }
    .cta { border-radius: 0; text-align: left; }
  }
  @media (max-width: 460px) { .sub { display: none; } }
</style>
