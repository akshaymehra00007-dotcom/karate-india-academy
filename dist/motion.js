(() => {
  const video = document.querySelector('#hero-video');
  const toggle = document.querySelector('.film-toggle');
  const hero = document.querySelector('.hero');
  if (!video || !toggle || !hero) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let requested = false;
  let wanted = false;
  let inView = true;
  const constrained = () => connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
  document.body.classList.toggle('save-data', Boolean(constrained()));
  toggle.hidden = false;
  function sync() {
    const playing = !video.paused;
    toggle.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.querySelector('.film-label').textContent = playing ? 'PAUSE FILM' : 'PLAY FILM';
    toggle.querySelector('.film-icon').textContent = playing ? 'Ⅱ' : '▶';
  }
  async function play() {
    if (!requested) {
      video.src = matchMedia('(max-width: 800px)').matches ? video.dataset.hd : video.dataset.uhd;
      requested = true;
      video.muted = true;
      video.load();
    }
    try { await video.play(); } catch { sync(); }
  }
  toggle.addEventListener('click', () => {
    wanted = video.paused;
    if (wanted) play(); else video.pause();
  });
  video.addEventListener('playing', () => { video.classList.add('is-playing'); sync(); });
  video.addEventListener('pause', sync);
  video.addEventListener('error', () => { video.classList.remove('is-playing'); wanted = false; sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) video.pause();
      else if (wanted && !document.hidden) play();
    }, { threshold: .08 }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (wanted && inView) play();
  });
  function honorPreferences() {
    document.body.classList.toggle('save-data', Boolean(constrained()));
    if (reducedMotion.matches || constrained()) { wanted = false; video.pause(); }
  }
  reducedMotion.addEventListener('change', honorPreferences);
  connection?.addEventListener('change', honorPreferences);
  document.querySelectorAll('.training-grid article,.review-grid article,.gallery-grid a').forEach((el,i) => {
    el.style.setProperty('--reveal-delay', `${(i % 3) * 90}ms`);
  });
  // Start after the core page is ready; the academy photograph remains the fallback.
  const start = () => {
    if (!reducedMotion.matches && !constrained()) {
      wanted = true;
      if (inView && !document.hidden) play();
    }
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
