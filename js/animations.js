/* ==========================================================================
   VELORA — ULTRA-SMOOTH ZERO-JITTER 60FPS MOTION ENGINE
   ========================================================================== */
(function () {
  'use strict';

  // 1. Preloader: show only on first visit in session; instant on subsequent page loads
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloaderProgress');
  if (preloader) {
    let seen = false;
    try { seen = sessionStorage.getItem('velora_intro_seen') === '1'; } catch (e) {}
    if (seen) {
      preloader.style.display = 'none';
      document.body.classList.add('velora-loaded');
    } else {
      try { sessionStorage.setItem('velora_intro_seen', '1'); } catch (e) {}
      if (bar) {
        bar.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
        requestAnimationFrame(() => { bar.style.transform = 'scaleX(1)'; });
      }
      setTimeout(() => {
        preloader.classList.add('is-parting');
        document.body.classList.add('velora-loaded');
        preloader.style.pointerEvents = 'none';
        setTimeout(() => { preloader.style.display = 'none'; }, 700);
      }, 550);
    }
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

  // 3. Lightweight IntersectionObserver for section & card reveals
  const revealEls = document.querySelectorAll('.section-header, .why-header, .why-card, .collection-panel, .room-card, .testimonial-card, .spotlight-stage, .spotlight-details');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach((el) => {
      el.classList.add('velora-reveal');
      io.observe(el);
    });
  }

  // 4. GPU-Only Scroll Progress Line
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

/* Hero Slider Controls */
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
