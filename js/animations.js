/* ==========================================================================
   VELORA — MASTER MOTION & INTERACTION ENGINE (js/animations.js)
   GSAP + ScrollTrigger + Lenis Smooth Scroll + SplitType
   ========================================================================== */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. LENIS BUTTERY SMOOTH SCROLL
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    window.VeloraLenis = lenis;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (window.VeloraCart && typeof window.VeloraCart.close === 'function') {
          window.VeloraCart.close();
        }
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -75 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Smooth Page-to-Page Transition Curtain
  const transitionCurtain = document.getElementById('pageTransitionCurtain');
  window.addEventListener('pageshow', () => {
    if (transitionCurtain && typeof gsap !== 'undefined') {
      gsap.set(transitionCurtain, { yPercent: 0 });
    }
  });
  if (transitionCurtain && typeof gsap !== 'undefined' && !prefersReducedMotion) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }
      e.preventDefault();
      gsap.to(transitionCurtain, {
        yPercent: -100,
        duration: 0.48,
        ease: 'power3.inOut',
        onComplete: () => {
          window.location.href = href;
        }
      });
    });
  }

  // 2. PRELOADER CURTAIN REVEAL + HERO ENTRANCE
  const preloader = document.getElementById('preloader');
  const preloaderProgress = document.getElementById('preloaderProgress');

  function runHeroEntrance() {
    if (typeof gsap === 'undefined') return;

    const heroTitleEl = document.querySelector('.hero-split');
    if (heroTitleEl && typeof SplitType !== 'undefined' && !prefersReducedMotion) {
      const heroSplit = new SplitType(heroTitleEl, { types: 'chars' });
      const totalChars = heroSplit.chars.length || 1;
      heroSplit.chars.forEach((charEl, idx) => {
        charEl.style.backgroundPosition = `${(idx / totalChars) * 100}% center`;
      });

      gsap.from(heroSplit.chars, {
        y: 55,
        opacity: 0,
        rotateX: -30,
        stagger: 0.045,
        duration: 0.95,
        ease: 'power4.out'
      });
    }

    if (document.querySelector('.hero-reveal')) {
      gsap.from('.hero-reveal', {
        y: 26,
        opacity: 0,
        stagger: 0.11,
        duration: 0.85,
        delay: 0.12,
        ease: 'power3.out'
      });
    }

    if (document.querySelector('.hero-arch-wrap')) {
      gsap.from('.hero-arch-wrap', {
        y: 36,
        opacity: 0,
        scale: 0.96,
        duration: 1.1,
        delay: 0.2,
        ease: 'power3.out'
      });
    }
  }

  if (preloader && typeof gsap !== 'undefined' && !prefersReducedMotion) {
    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        runHeroEntrance();
      }
    });
    tl.to(preloaderProgress, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' })
      .to('.preloader-logo-wrap', { y: -22, opacity: 0, duration: 0.4, ease: 'power2.in' })
      .to(preloader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '-=0.12');
  } else if (preloader) {
    preloader.style.display = 'none';
    runHeroEntrance();
  } else {
    runHeroEntrance();
  }

  // 3. FLOATING GOLD DUST PARTICLES IN HERO (Limited to 8 subtle motes)
  const particlesContainer = document.getElementById('heroParticles');
  if (particlesContainer && !prefersReducedMotion) {
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('span');
      dot.className = 'gold-dust';
      const size = Math.random() * 3.5 + 2;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${10 + Math.random() * 80}%`;
      dot.style.top = `${25 + Math.random() * 65}%`;
      dot.style.animationDuration = `${7 + Math.random() * 6}s`;
      dot.style.animationDelay = `${Math.random() * 4}s`;
      particlesContainer.appendChild(dot);
    }
  }

    // Subtle Mouse 3D Perspective Parallax on Hero Arch (Desktop only)
  const heroSectionEl = document.querySelector('.hero-section');
  const heroArchWrapEl = document.querySelector('.hero-arch-wrap');
  if (heroSectionEl && heroArchWrapEl && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion && typeof gsap !== 'undefined') {
    const moveX = gsap.quickTo(heroArchWrapEl, 'x', { duration: 0.8, ease: 'power3.out' });
    const moveY = gsap.quickTo(heroArchWrapEl, 'y', { duration: 0.8, ease: 'power3.out' });
    heroSectionEl.addEventListener('mousemove', (e) => {
      const rect = heroSectionEl.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
      moveX(nx);
      moveY(ny);
    });
    heroSectionEl.addEventListener('mouseleave', () => {
      moveX(0);
      moveY(0);
    });
  }
  // 4. HERO SHOWCASE SLIDER
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  let currentHeroSlide = 0;
  let heroAutoTimer = null;

  function showHeroSlide(index) {
    if (!heroSlides.length) return;
    currentHeroSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((s, i) => s.classList.toggle('is-active', i === currentHeroSlide));
    heroDots.forEach((d, i) => d.classList.toggle('is-active', i === currentHeroSlide));
  }

  function startHeroAuto() {
    clearInterval(heroAutoTimer);
    heroAutoTimer = setInterval(() => showHeroSlide(currentHeroSlide + 1), 4800);
  }

  document.getElementById('heroPrevBtn')?.addEventListener('click', () => {
    showHeroSlide(currentHeroSlide - 1);
    startHeroAuto();
  });
  document.getElementById('heroNextBtn')?.addEventListener('click', () => {
    showHeroSlide(currentHeroSlide + 1);
    startHeroAuto();
  });
  heroDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showHeroSlide(Number(dot.dataset.index));
      startHeroAuto();
    });
  });
  if (heroSlides.length) startHeroAuto();

    document.querySelectorAll('.nav-links .nav-link').forEach((navItem) => {
    navItem.addEventListener('click', () => {
      document.querySelectorAll('.nav-links .nav-link').forEach((n) => n.classList.remove('is-active'));
      navItem.classList.add('is-active');
    });
  });
  // 5. SMART HEADER
  const siteHeader = document.getElementById('siteHeader');
  const isHeroPage = Boolean(document.querySelector('.hero-section'));
  let lastScrollY = window.scrollY;

  function updateHeaderState() {
    const currentY = window.scrollY;
    if (siteHeader) {
      if (isHeroPage) {
        siteHeader.classList.toggle('is-scrolled', currentY > 50);
      } else {
        siteHeader.classList.add('is-scrolled');
      }
      if (currentY > 260 && currentY > lastScrollY) {
        siteHeader.classList.add('is-hidden');
      } else {
        siteHeader.classList.remove('is-hidden');
      }
    }
    lastScrollY = currentY;
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  document.getElementById('closeAnnouncement')?.addEventListener('click', () => {
    document.getElementById('announcementBar')?.classList.add('is-dismissed');
  });
  document.getElementById('searchToggleBtn')?.addEventListener('click', () => {
    const drawer = document.getElementById('searchDrawer');
    drawer?.classList.toggle('is-open');
    if (drawer?.classList.contains('is-open')) document.getElementById('liveSearchInput')?.focus();
  });
  document.getElementById('searchCloseBtn')?.addEventListener('click', () => {
    document.getElementById('searchDrawer')?.classList.remove('is-open');
  });
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    const mDrawer = document.getElementById('mobileDrawer');
    mDrawer?.classList.add('is-open');
    mDrawer?.setAttribute('aria-hidden', 'false');
    document.getElementById('mobileMenuBtn')?.setAttribute('aria-expanded', 'true');
    document.getElementById('drawerBackdrop')?.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    lenis?.stop();
  });
  document.getElementById('mobileMenuClose')?.addEventListener('click', () => {
    if (window.VeloraCart && typeof window.VeloraCart.close === 'function') {
      window.VeloraCart.close();
    } else {
      document.getElementById('mobileDrawer')?.classList.remove('is-open');
      document.getElementById('drawerBackdrop')?.classList.remove('is-visible');
      document.body.style.overflow = '';
      lenis?.start();
    }
  });

  // 7. MAGNETIC BUTTONS & GSAP QUICKTO 3D CARD TILT
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
    document.querySelectorAll('.btn-magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  window.bindVeloraCardTilt = function () {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion || typeof gsap === 'undefined') return;
    document.querySelectorAll('.product-card').forEach((card) => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = 'true';
      const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.35, ease: 'power3.out' });
      const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.35, ease: 'power3.out' });

      card.addEventListener('mouseenter', () => {
        card.classList.add('is-tilting');
        gsap.set(card, { transformPerspective: 900 });
      });
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        rotY(x * 7);
        rotX(-y * 7);
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-tilting');
        rotX(0);
        rotY(0);
      });
    });
  };
  window.bindVeloraCardTilt();

  // 8. SPOTLIGHT HOTSPOT PINS
  const hotspotPins = document.querySelectorAll('.hotspot-pin');
  const hotspotCard = document.getElementById('hotspotDisplayCard');
  hotspotPins.forEach((pin) => {
    pin.addEventListener('click', () => {
      hotspotPins.forEach((p) => p.classList.remove('is-active'));
      pin.classList.add('is-active');
      if (hotspotCard) {
        hotspotCard.innerHTML = `<h4>${pin.dataset.title}</h4><p>${pin.dataset.detail}</p>`;
      }
    });
  });

  // 9. TESTIMONIALS CAROUSEL + MOUSE-DRAG
  const testimonialsTrack = document.getElementById('testimonialsTrack');
  document.getElementById('reviewPrevBtn')?.addEventListener('click', () => {
    testimonialsTrack?.scrollBy({ left: -380, behavior: 'smooth' });
  });
  document.getElementById('reviewNextBtn')?.addEventListener('click', () => {
    testimonialsTrack?.scrollBy({ left: 380, behavior: 'smooth' });
  });

  if (testimonialsTrack) {
    let isDragging = false, startX = 0, scrollStart = 0;
    testimonialsTrack.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - testimonialsTrack.offsetLeft;
      scrollStart = testimonialsTrack.scrollLeft;
      testimonialsTrack.style.scrollBehavior = 'auto';
      testimonialsTrack.style.scrollSnapType = 'none';
    });
    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      testimonialsTrack.style.scrollBehavior = 'smooth';
      testimonialsTrack.style.scrollSnapType = 'x mandatory';
    });
    testimonialsTrack.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - testimonialsTrack.offsetLeft;
      testimonialsTrack.scrollLeft = scrollStart - (x - startX) * 1.4;
    });
  }

  // 10. NEWSLETTER FORM
  document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    const feedback = document.getElementById('newsletterFeedback');
    if (emailInput && feedback) {
      feedback.textContent = `Welcome to Velora! Your code VELORA10 has been sent to ${emailInput.value}.`;
      emailInput.value = '';
    }
  });

  // 11. GSAP SCROLLTRIGGER CHOREOGRAPHY
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Line-by-line section heading reveals via SplitType
    if (typeof SplitType !== 'undefined') {
      document.querySelectorAll('.section-title').forEach((heading) => {
        const splitLines = new SplitType(heading, { types: 'lines' });
        gsap.from(splitLines.lines, {
          yPercent: 100,
          opacity: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: heading, start: 'top 88%', once: true }
        });
      });
    }

    // Clip-path polygon image reveals (.reveal-clip)
    document.querySelectorAll('.reveal-clip').forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(14% 0% 14% 0%)', opacity: 0.2 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true }
        }
      );
    });

    // Subtle Scroll Parallax on Hero Arch & Room Media
    if (document.querySelector('.hero-visual')) { gsap.to('.hero-visual', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    document.querySelectorAll('.room-media').forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });

    // Category icons stagger
    if (document.querySelector('.category-strip')) {
      gsap.from('.category-card', {
        scrollTrigger: { trigger: '.category-strip', start: 'top 86%' },
        y: 24,
        opacity: 0,
        stagger: 0.07,
        duration: 0.65,
        ease: 'power3.out'
      });
    }

    // Pinned Horizontal Scroll for Collections (Desktop via gsap.matchMedia)
    const collectionsSection = document.querySelector('.collections-section');
    const collectionsTrack = document.getElementById('collectionsTrack');
    if (collectionsSection && collectionsTrack) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 769px)', () => {
        const getScrollAmount = () => -(collectionsTrack.scrollWidth - window.innerWidth + 80);
        gsap.to(collectionsTrack, {
          x: getScrollAmount,
          ease: 'none',
          scrollTrigger: {
            trigger: collectionsSection,
            start: 'top top',
            end: () => `+=${Math.abs(getScrollAmount())}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
        const colFill = document.getElementById('collectionsProgressFill');
        if (colFill) {
          gsap.to(colFill, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: collectionsSection,
              start: 'top top',
              end: () => `+=${Math.abs(getScrollAmount())}`,
              scrub: 0.5
            }
          });
        }
      });
    }

    // Why Velora cards stagger
    if (document.querySelector('.pillars-grid')) {
      gsap.from('.why-card', {
        scrollTrigger: { trigger: '.pillars-grid', start: 'top 84%' },
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.75,
        ease: 'power3.out'
      });
    }

    // Sync & animate counters from VELORA_SITE_CONFIG
    if (typeof VELORA_SITE_CONFIG !== 'undefined' && Array.isArray(VELORA_SITE_CONFIG.metrics)) {
      const counterEls = document.querySelectorAll('.counter-item');
      VELORA_SITE_CONFIG.metrics.forEach((m, i) => {
        if (counterEls[i]) {
          const numEl = counterEls[i].querySelector('.counter-number');
          const lblEl = counterEls[i].querySelector('.counter-label');
          if (numEl) { numEl.dataset.target = m.target; numEl.dataset.suffix = m.suffix; }
          if (lblEl) { lblEl.textContent = m.label; }
        }
      });
    }

    document.querySelectorAll('.counter-number').forEach((counter) => {
      const target = Number(counter.dataset.target || 0);
      const suffix = counter.dataset.suffix || '';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: counter, start: 'top 88%', once: true },
        onUpdate: () => {
          counter.textContent = Math.floor(obj.val).toLocaleString('en-IN') + suffix;
        }
      });
    });

    // Footer VELORA Watermark Gold Fill on Scroll
    const watermark = document.getElementById('footerWatermark');
    if (watermark) {
      gsap.to(watermark, {
        backgroundSize: '100% 100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.footer-watermark-wrap',
          start: 'top 92%',
          end: 'bottom 68%',
          scrub: 0.8
        }
      });
    }

        // Top Gold Scroll Progress Line
    const progressLine = document.getElementById('scrollProgressBar');
    if (progressLine) {
      gsap.to(progressLine, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.25
        }
      });
    }
    ScrollTrigger.sort();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
})();




