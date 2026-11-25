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

// 5. Flagship Atelier Details: Dynamic Save Pills, Card Swatch Selection & Cart VIP Bar
(() => {
  const enhanceCards = () => {
    document.querySelectorAll('.product-card').forEach(card => {
      // Interactive finish dots on cards
      const dots = card.querySelectorAll('.finish-dot, .swatch-dot');
      dots.forEach(dot => {
        if (dot.dataset.swatchBound) return;
        dot.dataset.swatchBound = '1';
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dots.forEach(d => d.classList.remove('is-selected'));
          dot.classList.add('is-selected');
          const label = dot.getAttribute('title') || dot.dataset.finish;
          const meta = card.querySelector('.product-meta, .card-meta, .product-room');
          if (label && meta) {
            const base = meta.dataset.baseText || meta.textContent.split('•')[0].trim();
            meta.dataset.baseText = base;
            meta.textContent = base + ' • ' + label;
          }
        });
      });

      // Dynamic Savings Pill next to MRP
      const priceBox = card.querySelector('.product-price-box');
      if (priceBox && !priceBox.querySelector('.velora-save-pill')) {
        const nowEl = priceBox.querySelector('.price-now');
        const mrpEl = priceBox.querySelector('.price-mrp');
        if (nowEl && mrpEl) {
          const now = Number(nowEl.textContent.replace(/[^0-9]/g, ''));
          const mrp = Number(mrpEl.textContent.replace(/[^0-9]/g, ''));
          if (mrp > now && now > 0) {
            const pct = Math.round(((mrp - now) / mrp) * 100);
            const pill = document.createElement('span');
            pill.className = 'velora-save-pill';
            pill.textContent = pct + '% OFF';
            priceBox.appendChild(pill);
          }
        }
      }
    });
  };

  // Inject VIP Free Shipping Banner inside Cart Drawer
  const injectCartVip = () => {
    const cartFooter = document.querySelector('.cart-footer, #cartDrawer .drawer-footer');
    if (cartFooter && !cartFooter.querySelector('.velora-cart-vip')) {
      const vip = document.createElement('div');
      vip.className = 'velora-cart-vip';
      vip.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>&#10022; <strong>Complimentary Insured Pan-India Delivery</strong></span>
          <span style="font-weight:700;color:#7c5812;">UNLOCKED</span>
        </div>
        <div class="velora-vip-bar"><div class="velora-vip-fill"></div></div>
      `;
      cartFooter.insertBefore(vip, cartFooter.firstChild);
    }
  };

  // Inject Atelier Craftsmanship Strip on Product Detail Page (product.html)
  const injectPdpTrust = () => {
    const pdpActions = document.querySelector('.pdp-actions, .pdp-details');
    if (pdpActions && !document.querySelector('.velora-atelier-trust')) {
      const strip = document.createElement('div');
      strip.className = 'velora-atelier-trust';
      strip.innerHTML = `
        <div class="velora-trust-cell"><strong>304-Grade Steel</strong><span>Anti-Rust Architectural Finish</span></div>
        <div class="velora-trust-cell"><strong>5-Year Warranty</strong><span>Structural Craftsmanship Guarantee</span></div>
        <div class="velora-trust-cell"><strong>Insured Transit</strong><span>24–48 Hr Pan-India Dispatch</span></div>
      `;
      pdpActions.appendChild(strip);
    }
  };

  const runAll = () => {
    enhanceCards();
    injectCartVip();
    injectPdpTrust();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }
  window.addEventListener('velora:catalogUpdated', () => setTimeout(runAll, 80));
})();
