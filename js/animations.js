/* ==========================================================================
   VELORA — LUXURY VELVET CURTAIN, MAGNETIC CTAS & 60FPS MOTION ENGINE
   ========================================================================== */
(function () {
  'use strict';

  // 1. Haute-Couture Velvet Curtain Reveal (smooth, crisp, non-blocking)
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloaderProgress');
  function openVelvetCurtain(delayMs) {
    if (!preloader) return;
    preloader.classList.remove('is-closing');
    if (bar) {
      bar.style.transition = 'transform ' + (delayMs / 1000).toFixed(2) + 's cubic-bezier(0.22, 1, 0.36, 1)';
      requestAnimationFrame(() => { bar.style.transform = 'scaleX(1)'; });
    }
    setTimeout(() => {
      preloader.classList.add('is-parting');
      document.body.classList.add('velora-loaded');
      preloader.style.pointerEvents = 'none';
      setTimeout(() => { preloader.style.display = 'none'; }, 1050);
    }, delayMs);
  }
  if (preloader) {
    const isSubPage = /shop\.html|product\.html|policies\.html/i.test(window.location.pathname);
    openVelvetCurtain(isSubPage ? 440 : 780);
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) openVelvetCurtain(240);
    });
  } else {
    document.body.classList.add('velora-loaded');
  }

  // 2. Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        if (window.VeloraCart && typeof window.VeloraCart.close === 'function') window.VeloraCart.close();
        const y = target.getBoundingClientRect().top + window.scrollY - 82;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // 3. Staggered Luxury Scroll Reveals
  const revealEls = document.querySelectorAll(
    '.section-header, .why-header, .why-card, .collection-panel, .room-card, .testimonial-card, .spotlight-stage, .spotlight-details, .pillar-item'
  );
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = Math.min(idx * 50, 260) + 'ms';
          entry.target.classList.add('is-revealed', 'is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    revealEls.forEach((el) => {
      el.classList.add('velora-reveal');
      io.observe(el);
    });
  }

  // 4. Smooth Animated Counters (fixes 0 counters cleanly)
  document.querySelectorAll('[data-target], [data-count], .counter-number, .stat-number').forEach((counter) => {
    const raw = (counter.getAttribute('data-target') || counter.getAttribute('data-count')) || counter.textContent.replace(/[^0-9]/g, '');
    const target = parseInt(raw, 10);
    if (!target || isNaN(target)) return;
    const suffix = counter.getAttribute('data-suffix') || (counter.textContent.includes('+') ? '+' : '');
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        cio.unobserve(counter);
        const start = performance.now();
        const dur = 1100;
        const step = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const ease = 1 - Math.pow(1 - t, 3);
          counter.textContent = Math.floor(target * ease).toLocaleString('en-IN') + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.15 });
      cio.observe(counter);
    } else {
      counter.textContent = target.toLocaleString('en-IN') + suffix;
    }
  });

  // 5. Desktop Magnetic Pull on Primary Gold & Outline CTAs
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn-magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.20;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // 6. GPU-Only Scroll Progress Line & Header Scroll State
  const progressLine = document.getElementById('scrollProgressBar');
  const hdr = document.querySelector('.site-header');
  let maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  window.addEventListener('resize', () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }, { passive: true });

  let ticking = false;
  let lastScrolled = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (progressLine) progressLine.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / maxScroll)) + ')';
      const isSc = y > 30;
      if (hdr && isSc !== lastScrolled) {
        lastScrolled = isSc;
        hdr.classList.toggle('is-scrolled', isSc);
      }
      ticking = false;
    });
  }, { passive: true });
})();

/* Hero Slider Controls (Auto-play + Manual Arrows & Dots) */
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let idx = 0;
  function showSlide(n) {
    if (!slides.length) return;
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }
  document.getElementById('heroNextBtn')?.addEventListener('click', () => showSlide(idx + 1));
  document.getElementById('heroPrevBtn')?.addEventListener('click', () => showSlide(idx - 1));
  dots.forEach((d, i) => d.addEventListener('click', () => showSlide(i)));
  if (slides.length > 1) {
    setInterval(() => {
      if (!document.hidden) showSlide(idx + 1);
    }, 5500);
  }
})();

/* Mobile Menu, Search Drawer & Announcement Bar Controls */
(function () {
  const mBtn = document.getElementById('mobileMenuBtn');
  const mDrawer = document.getElementById('mobileDrawer');
  const mClose = document.getElementById('mobileMenuClose');
  const backdrop = document.getElementById('drawerBackdrop');

  function closeMobile() {
    if (mDrawer) {
      mDrawer.classList.remove('is-open');
      mDrawer.setAttribute('aria-hidden', 'true');
    }
    if (mBtn) mBtn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('is-visible');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  mBtn?.addEventListener('click', () => {
    if (mDrawer) {
      mDrawer.classList.add('is-open');
      mDrawer.setAttribute('aria-hidden', 'false');
    }
    if (mBtn) mBtn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.classList.add('is-visible');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  });
  mClose?.addEventListener('click', closeMobile);
  document.querySelectorAll('.mobile-nav-link').forEach((l) => l.addEventListener('click', closeMobile));

  const sBtn = document.getElementById('searchToggleBtn');
  const sDrawer = document.getElementById('searchDrawer');
  const sClose = document.getElementById('searchCloseBtn');
  sBtn?.addEventListener('click', () => {
    if (sDrawer) {
      sDrawer.classList.toggle('is-open');
      document.getElementById('liveSearchInput')?.focus();
    }
  });
  sClose?.addEventListener('click', () => sDrawer?.classList.remove('is-open'));
  document.getElementById('closeAnnouncement')?.addEventListener('click', () => {
    document.getElementById('announcementBar')?.classList.add('is-dismissed');
  });
})();

/* Interactive Spotlight Hotspots & Testimonial Carousel Controls */
(function () {
  const pins = document.querySelectorAll('.hotspot-pin');
  const card = document.getElementById('hotspotDisplayCard');
  if (pins.length && card) {
    pins.forEach((pin) => {
      pin.addEventListener('click', () => {
        pins.forEach((p) => p.classList.remove('is-active'));
        pin.classList.add('is-active');
        const h4 = card.querySelector('h4');
        const p = card.querySelector('p');
        if (h4) h4.textContent = pin.getAttribute('data-title') || '';
        if (p) p.textContent = pin.getAttribute('data-detail') || '';
      });
    });
  }
  const track = document.getElementById('testimonialsTrack');
  document.getElementById('reviewPrevBtn')?.addEventListener('click', () => {
    if (track) track.scrollBy({ left: -340, behavior: 'smooth' });
  });
  document.getElementById('reviewNextBtn')?.addEventListener('click', () => {
    if (track) track.scrollBy({ left: 340, behavior: 'smooth' });
  });
})();

