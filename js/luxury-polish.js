/* ==========================================================================
   VELORA — RUNTIME SMOOTHNESS, IMAGE GUARD & MICRO-INTERACTIONS
   ========================================================================== */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Broken Image Auto-Recovery (protects against typos in Google Sheet URLs)
  const attachImgGuard = (root = document) => {
    root.querySelectorAll('img').forEach(img => {
      if (img.dataset.guardAttached) return;
      img.dataset.guardAttached = '1';
      img.addEventListener('error', () => {
        if (!img.src.includes('assets/images/product-1.jpg')) {
          img.src = 'assets/images/product-1.jpg';
        }
      });
    });
  };
  attachImgGuard();
  window.addEventListener('velora:catalogUpdated', () => setTimeout(() => attachImgGuard(), 60));

  // 2. Frosted Sticky Header Scroll State
  const header = document.querySelector('header, .site-header, .navbar');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (prefersReduced) return;

  // 3. Staggered Scroll Reveals via IntersectionObserver
  const revealTargets = document.querySelectorAll(
    '.collection-panel, .room-card, .pillar-item, .spotlight-grid > div, .why-card, .review-card'
  );
  if ('IntersectionObserver' in window && revealTargets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = Math.min(idx * 55, 280) + 'ms';
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealTargets.forEach(el => {
      el.classList.add('velora-reveal');
      io.observe(el);
    });
  }

  // 4. Subtle Magnetic Pull on Desktop Primary CTAs
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.14;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
})();
