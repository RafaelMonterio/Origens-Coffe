/* ═══════════════════════════════════════════════════════════════
   ORIGENS — Scroll Animations v1.0
   Elementos surgem de direções aleatórias (baixo, esquerda, direita)
   e desaparecem conforme o usuário rola a tela.
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const CONFIG = {
    threshold: 0.10,
    rootMargin: '0px 0px -40px 0px',
    staggerBase: 80,
    transitionDuration: 900,
    transitionEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fadeOutDuration: 600,
    fadeOutEasing: 'cubic-bezier(0.55, 0, 1, 0.45)',
  };

  const DIRECTIONS = [
    { tx: '0px',    ty: '80px',  name: 'bottom' },
    { tx: '0px',    ty: '100px', name: 'bottom' },
    { tx: '0px',    ty: '120px', name: 'bottom' },
    { tx: '-100px', ty: '30px',  name: 'left'   },
    { tx: '-140px', ty: '0px',   name: 'left'   },
    { tx: '100px',  ty: '30px',  name: 'right'  },
    { tx: '140px',  ty: '0px',   name: 'right'  },
    { tx: '-80px',  ty: '80px',  name: 'bl'     },
    { tx: '80px',   ty: '80px',  name: 'br'     },
  ];

  const EXIT_UP    = { tx: '0px',   ty: '-60px' };
  const EXIT_LEFT  = { tx: '-80px', ty: '-20px' };
  const EXIT_RIGHT = { tx: '80px',  ty: '-20px' };

  function randomDir() {
    return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  }

  function exitDir(entryName) {
    if (entryName === 'left')  return EXIT_LEFT;
    if (entryName === 'right') return EXIT_RIGHT;
    return EXIT_UP;
  }

  function collectTargets() {
    const selectors = [
      '.reveal', '.reveal-left', '.reveal-right',
      'h1:not(.no-anim)', 'h2:not(.no-anim)', 'h3:not(.no-anim)',
      '.section-title:not(.no-anim)', '.section-sub:not(.no-anim)',
      '.section-eyebrow:not(.no-anim)', '.cta-title:not(.no-anim)',
      '.cta-sub:not(.no-anim)', '.cta-buttons:not(.no-anim)',
      '.prod-card:not(.no-anim)', '.processo-card:not(.no-anim)',
      '.kit-card:not(.no-anim)', '.curso-card:not(.no-anim)',
      '.blog-card:not(.no-anim)', '.plan-card:not(.no-anim)',
      '.sobre-photo-inner:not(.no-anim)', '.sobre-quote:not(.no-anim)',
      '.sobre-stats:not(.no-anim)', '.stat-val:not(.no-anim)',
      '.hero-actions:not(.no-anim)', '.hero-logo-block:not(.no-anim)',
      '.store-grid:not(.no-anim)', '.page-header-copo:not(.no-anim)',
      '.filter-bar:not(.no-anim)', '.perfil-card:not(.no-anim)',
      '.contato-form:not(.no-anim)', '.checkout-step:not(.no-anim)',
    ];

    const seen = new Set();
    const targets = [];
    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          if (!seen.has(el)) { seen.add(el); targets.push(el); }
        });
      } catch (e) {}
    });
    return targets;
  }

  const state = new Map();

  function initElement(el) {
    if (state.has(el)) return;

    let dir;
    if (el.classList.contains('reveal-left')) {
      dir = DIRECTIONS.find(d => d.name === 'left') || randomDir();
    } else if (el.classList.contains('reveal-right')) {
      dir = DIRECTIONS.find(d => d.name === 'right') || randomDir();
    } else {
      dir = randomDir();
    }

    state.set(el, { dir, visible: false, delay: 0 });
    setHidden(el, dir);
  }

  function setHidden(el, dir) {
    el.style.opacity = '0';
    el.style.transform = `translate(${dir.tx}, ${dir.ty})`;
    el.style.transition = 'none';
    el.style.willChange = 'opacity, transform';
  }

  function animateIn(el) {
    const s = state.get(el);
    if (!s || s.visible) return;
    s.visible = true;
    clearTimeout(s.timer);
    s.timer = setTimeout(() => {
      el.style.transition = [
        `opacity ${CONFIG.transitionDuration}ms ${CONFIG.transitionEasing}`,
        `transform ${CONFIG.transitionDuration}ms ${CONFIG.transitionEasing}`,
      ].join(', ');
      el.style.opacity = '1';
      el.style.transform = 'translate(0px, 0px)';
      el.classList.add('in');
    }, s.delay || 0);
  }

  function animateOut(el) {
    const s = state.get(el);
    if (!s || !s.visible) return;
    s.visible = false;
    clearTimeout(s.timer);
    const exit = exitDir(s.dir.name);
    el.style.transition = [
      `opacity ${CONFIG.fadeOutDuration}ms ${CONFIG.fadeOutEasing}`,
      `transform ${CONFIG.fadeOutDuration}ms ${CONFIG.fadeOutEasing}`,
    ].join(', ');
    el.style.opacity = '0';
    el.style.transform = `translate(${exit.tx}, ${exit.ty})`;
    el.classList.remove('in');
  }

  let enterObs, exitObs;

  function setupObservers(targets) {
    enterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animateIn(entry.target);
      });
    }, { threshold: CONFIG.threshold, rootMargin: CONFIG.rootMargin });

    exitObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          if (rect.bottom < 0) animateOut(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px' });

    targets.forEach(el => {
      enterObs.observe(el);
      exitObs.observe(el);
    });
  }

  function applyStaggerGroups() {
    const groups = [
      '.produto-grid', '.prod-grid', '.kit-grid', '.cursos-grid',
      '.blog-grid', '.plan-grid', '.sobre-stats', '.cta-buttons',
      '.hero-actions', '.processo-track', '.store-grid',
    ];
    groups.forEach(sel => {
      document.querySelectorAll(sel).forEach(container => {
        Array.from(container.children)
          .filter(c => state.has(c))
          .forEach((child, i) => {
            const s = state.get(child);
            if (s) s.delay = i * CONFIG.staggerBase;
          });
      });
    });
  }

  function init() {
    const targets = collectTargets();
    if (!targets.length) return;
    targets.forEach(el => initElement(el));
    applyStaggerGroups();
    targets.forEach(el => el.getBoundingClientRect()); // força reflow
    setupObservers(targets);
  }

  // Observa elementos adicionados dinamicamente
  const mutObs = new MutationObserver(() => {
    setTimeout(() => {
      const newTargets = collectTargets().filter(el => !state.has(el));
      newTargets.forEach(el => {
        initElement(el);
        enterObs && enterObs.observe(el);
        exitObs  && exitObs.observe(el);
      });
    }, 100);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => requestAnimationFrame(init));
      mutObs.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(init));
    mutObs.observe(document.body, { childList: true, subtree: true });
  }

})();