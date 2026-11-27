/* ==========================================================================
   VELORA — IMAGE RECOVERY, DYNAMIC SAVE PILLS & CART SHIPPING BAR
   ========================================================================== */
(() => {
  'use strict';

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

  const enhanceCards = () => {
    document.querySelectorAll('.product-card').forEach(card => {
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

  const runAll = () => {
    attachImgGuard();
    enhanceCards();
    injectCartVip();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }
  window.addEventListener('velora:catalogUpdated', () => requestAnimationFrame(runAll));

  document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = document.getElementById('newsletterEmail');
    const fb = document.getElementById('newsletterFeedback');
    const email = inp ? inp.value.trim() : '';
    if (!email) return;
    try {
      const saved = JSON.parse(localStorage.getItem('velora_newsletter') || '[]');
      if (!saved.includes(email)) saved.push(email);
      localStorage.setItem('velora_newsletter', JSON.stringify(saved));
    } catch (err) {}
    if (inp) inp.value = '';
    if (fb) fb.textContent = 'Subscribed! Apply code VELORA10 at checkout for 10% OFF.';
    const t = document.getElementById('veloraToast');
    if (t) {
      t.textContent = 'Welcome to VELORA Privé — use code VELORA10 for 10% OFF.';
      t.classList.add('is-visible');
      setTimeout(() => t.classList.remove('is-visible'), 3600);
    }
  });
})();


/* VELORA LIVE CATALOG HOMEPAGE SYNC */
(function syncHomepageWithLiveCatalog() {
  function applySync() {
    const Store = window.VeloraStore;
    if (!Store || typeof Store.getProducts !== 'function') return;
    const products = Store.getProducts().filter(p => String(p.status || 'active').toLowerCase() !== 'hidden');
    if (!products.length) return;

    const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

    // 1. Sync Hero Showcase Arch Slides with actual live products
    const heroSlides = document.querySelectorAll('.hero-slide, .showcase-slide, [data-hero-slide]');
    if (heroSlides.length) {
      heroSlides.forEach((slide, i) => {
        const p = products[i % products.length];
        const img = slide.querySelector('img');
        const titleEl = slide.querySelector('h2, h3, .slide-title, .hero-caption-title, span');
        const priceEl = slide.querySelector('.slide-price, .hero-caption-price, strong');
        if (img && p.image) { img.src = p.image; img.alt = p.name; }
        if (titleEl && p.name) titleEl.textContent = p.name;
        if (priceEl && p.price) priceEl.textContent = fmt(p.price);
      });
    }

    // 2. Sync Featured Product Spotlight image & specs with live first product
    const feat = products[0];
    const featSec = document.querySelector('#featured-product, .featured-spotlight, [data-featured-section]');
    if (featSec && feat) {
      const featImg = featSec.querySelector('img');
      if (featImg && feat.image) { featImg.src = feat.image; featImg.alt = feat.name; }
      featSec.querySelectorAll('.hotspot-pin, .hotspot-card, [data-hotspot]').forEach(el => el.style.display = 'none');
    }

    // 3. Update Collection Cards piece counts & starting prices dynamically
    document.querySelectorAll('[data-category], .collection-card').forEach(card => {
      const cat = (card.getAttribute('data-category') || '').toLowerCase();
      if (!cat) return;
      const matching = products.filter(p => String(p.category || '').toLowerCase() === cat);
      const pill = card.querySelector('.piece-count, .collection-count, [data-piece-count]');
      if (pill) {
        pill.textContent = matching.length === 1 ? '1 PIECE' : `${matching.length} PIECES`;
      }
      const fromEl = card.querySelector('.collection-price, [data-from-price]');
      if (fromEl && matching.length > 0) {
        const minPrice = Math.min(...matching.map(m => Number(m.price) || 0));
        fromEl.textContent = `FROM ${fmt(minPrice)}`;
      }
    });
  }

  window.addEventListener('velora:catalog-updated', applySync);
  document.addEventListener('DOMContentLoaded', () => setTimeout(applySync, 400));
  setTimeout(applySync, 1200);
})();
