/* ==========================================================================
   VELORA — ULTRA-SMOOTH ZERO-JITTER 60FPS MOTION ENGINE
   ========================================================================== */
(function () {
      // 1. Haute-Couture Velvet Red-Carpet Curtain Reveal (Page Enter + Cross-Page Navigation)
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
      preloader.classList.add('is-parting'); document.body.classList.add('velora-loaded');
      preloader.style.pointerEvents = 'none';
      setTimeout(() => { preloader.style.display = 'none'; }, 880);
    }, delayMs);
  }
  if (preloader) {
    const isSubPage = /shop\.html|product\.html/i.test(window.location.pathname);
    openVelvetCurtain(isSubPage ? 420 : 840);
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) openVelvetCurtain(260);
    });
  }

  // Intercept internal page navigations (Home <-> Catalog <-> Product Detail) for seamless velvet curtain close
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || !preloader) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    preloader.classList.remove('is-parting');
    preloader.style.display = 'flex';
    if (bar) { bar.style.transition = 'none'; bar.style.transform = 'scaleX(0.35)'; }
    requestAnimationFrame(() => {
      preloader.classList.add('is-closing');
      if (bar) {
        bar.style.transition = 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)';
        bar.style.transform = 'scaleX(0.85)';
      }
    });
    setTimeout(() => { window.location.href = href; }, 440);
  });

  // 2. Smooth anchor scrolling (native hardware-accelerated)
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

  // 3. Lightweight IntersectionObserver for crisp, zero-jitter section & card reveals
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

  // 4. Smooth Animated Counters (runs once cleanly when visible)
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
        const dur = 950;
        const step = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const ease = 1 - Math.pow(1 - t, 3);
          counter.textContent = Math.floor(target * ease).toLocaleString('en-IN') + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.2 });
      cio.observe(counter);
    }
  });

    // 5. Ultra-Light GPU-Only Scroll Progress Line (Zero Layout Thrashing / Zero Jitter)
  const progressLine = document.getElementById('scrollProgressBar');
  const hdr = document.querySelector('.site-header');
  let maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  window.addEventListener('resize', () => { maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }, { passive: true });
  let ticking = false;
  let lastScrolled = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (progressLine) progressLine.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / maxScroll)) + ')';
      const isSc = y > 30;
      if (hdr && isSc !== lastScrolled) { lastScrolled = isSc; hdr.classList.toggle('is-scrolled', isSc); }
      ticking = false;
    });
  }, { passive: true });
})();

/* Lightweight Hero Slider & Navbar Scroll */
(function(){ var slides = document.querySelectorAll('.hero-slide'); var dots = document.querySelectorAll('.hero-dot'); var idx = 0; function showSlide(n){ if(!slides.length) return; idx = (n + slides.length) % slides.length; slides.forEach(function(s,i){ s.classList.toggle('is-active', i === idx); }); dots.forEach(function(d,i){ d.classList.toggle('is-active', i === idx); }); } document.getElementById('heroNextBtn')?.addEventListener('click', function(){ showSlide(idx + 1); }); document.getElementById('heroPrevBtn')?.addEventListener('click', function(){ showSlide(idx - 1); }); dots.forEach(function(d,i){ d.addEventListener('click', function(){ showSlide(i); }); });  })();








/* Mobile Menu, Search Drawer & Announcement Bar Controls */
(function(){
  var mBtn = document.getElementById('mobileMenuBtn');
  var mDrawer = document.getElementById('mobileDrawer');
  var mClose = document.getElementById('mobileMenuClose');
  var backdrop = document.getElementById('drawerBackdrop');
  function closeMobile(){ if(mDrawer){ mDrawer.classList.remove('is-open'); mDrawer.setAttribute('aria-hidden','true'); } if(backdrop) backdrop.classList.remove('is-visible'); document.body.style.overflow=''; }
  mBtn?.addEventListener('click', function(){ if(mDrawer){ mDrawer.classList.add('is-open'); mDrawer.setAttribute('aria-hidden','false'); } if(backdrop) backdrop.classList.add('is-visible'); document.body.style.overflow='hidden'; });
  mClose?.addEventListener('click', closeMobile);
  document.querySelectorAll('.mobile-nav-link').forEach(function(l){ l.addEventListener('click', closeMobile); });
  var sBtn = document.getElementById('searchToggleBtn');
  var sDrawer = document.getElementById('searchDrawer');
  var sClose = document.getElementById('searchCloseBtn');
  sBtn?.addEventListener('click', function(){ if(sDrawer){ sDrawer.classList.toggle('is-open'); document.getElementById('liveSearchInput')?.focus(); } });
  sClose?.addEventListener('click', function(){ if(sDrawer) sDrawer.classList.remove('is-open'); });
  document.getElementById('closeAnnouncement')?.addEventListener('click', function(){ document.getElementById('announcementBar')?.classList.add('is-dismissed'); });
})();



/* Interactive Spotlight Hotspots & Testimonial Carousel Controls */
(function(){
  var pins = document.querySelectorAll('.hotspot-pin');
  var card = document.getElementById('hotspotDisplayCard');
  if (pins.length && card) {
    pins.forEach(function(pin){
      pin.addEventListener('click', function(){
        pins.forEach(function(p){ p.classList.remove('is-active'); });
        pin.classList.add('is-active');
        var h4 = card.querySelector('h4');
        var p = card.querySelector('p');
        if (h4) h4.textContent = pin.getAttribute('data-title') || '';
        if (p) p.textContent = pin.getAttribute('data-detail') || '';
      });
    });
  }
  var track = document.getElementById('testimonialsTrack');
  document.getElementById('reviewPrevBtn')?.addEventListener('click', function(){ if(track) track.scrollBy({ left: -340, behavior: 'smooth' }); });
  document.getElementById('reviewNextBtn')?.addEventListener('click', function(){ if(track) track.scrollBy({ left: 340, behavior: 'smooth' }); });
})();



