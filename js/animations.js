/* ==========================================================================
   VELORA — ULTRA-SMOOTH ZERO-JITTER 60FPS MOTION ENGINE
   ========================================================================== */
(function () {
  // 1. Velvet Curtain + Gold Progress Bar Preloader
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloaderProgress');
  if (preloader) {
    if (bar) {
      bar.style.transition = 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)';
      setTimeout(() => { bar.style.transform = 'scaleX(1)'; }, 60);
    }
    setTimeout(() => {
      preloader.style.transition = 'transform 0.65s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.45s ease';
      preloader.style.transform = 'translateY(-100%)';
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      setTimeout(() => { preloader.style.display = 'none'; }, 680);
    }, 850);
  }

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
  document.querySelectorAll('[data-count], .stat-number').forEach((counter) => {
    const raw = counter.getAttribute('data-count') || counter.textContent.replace(/[^0-9]/g, '');
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

  // 5. Passive 60fps Scroll Progress Bar & Footer VELORA Gold Fill
  const progressLine = document.getElementById('scrollProgressBar');
  const watermark = document.getElementById('footerWatermark');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progressLine && docHeight > 0) {
        progressLine.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollTop / docHeight))})`;
      }
      if (watermark) {
        const rect = watermark.getBoundingClientRect();
        const pct = Math.min(100, Math.max(0, ((window.innerHeight - rect.top) / (rect.height + 140)) * 100));
        watermark.style.backgroundSize = `${pct.toFixed(1)}% 100%`;
      }
      ticking = false;
    });
  }, { passive: true });
})();

/* Lightweight Hero Slider & Navbar Scroll */
(function(){ var slides = document.querySelectorAll('.hero-slide'); var dots = document.querySelectorAll('.hero-dot'); var idx = 0; function showSlide(n){ if(!slides.length) return; idx = (n + slides.length) % slides.length; slides.forEach(function(s,i){ s.classList.toggle('is-active', i === idx); }); dots.forEach(function(d,i){ d.classList.toggle('is-active', i === idx); }); } document.getElementById('heroNextBtn')?.addEventListener('click', function(){ showSlide(idx + 1); }); document.getElementById('heroPrevBtn')?.addEventListener('click', function(){ showSlide(idx - 1); }); dots.forEach(function(d,i){ d.addEventListener('click', function(){ showSlide(i); }); }); var hdr = document.querySelector('.site-header'); window.addEventListener('scroll', function(){ if(hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 30); }, { passive: true }); })();




