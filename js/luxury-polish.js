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
    const primary = products[0];

    // 1. Hero Arch Slides (.hero-slide + .hero-floating-tag)
    document.querySelectorAll('.hero-slide').forEach((slide, i) => {
      const p = products[i % products.length];
      const img = slide.querySelector('img');
      const labelEl = slide.querySelector('.tag-label');
      const titleEl = slide.querySelector('.hero-floating-tag strong');
      const priceEl = slide.querySelector('.tag-price');
      if (img && p.image) { img.src = p.image; img.alt = p.name; }
      if (labelEl) labelEl.textContent = p.badge || 'Curated Piece';
      if (titleEl) titleEl.textContent = p.name;
      if (priceEl) priceEl.textContent = fmt(p.price);
    });

    // 2. Featured Spotlight Section (replace hardcoded garment rack image + hotspot text)
    const hotspotTitle = document.querySelector('h4');
    document.querySelectorAll('section').forEach(sec => {
      if (sec.innerHTML.includes('95cm Steel Hanging Crossbar') || sec.innerHTML.includes('FEATURED PRODUCT')) {
        const imgs = sec.querySelectorAll('img');
        imgs.forEach(img => {
          if (primary.image) { img.src = primary.image; img.alt = primary.name; }
        });
        sec.querySelectorAll('[data-title], .hotspot-btn, .hotspot-dot, button[data-hotspot]').forEach(btn => {
          btn.style.display = 'none';
        });
        const cardH4 = sec.querySelector('h4');
        const cardP = cardH4 ? cardH4.nextElementSibling : null;
        if (cardH4) cardH4.textContent = primary.name;
        if (cardP && cardP.tagName === 'P') {
          cardP.textContent = primary.material || primary.description || 'Handcrafted luxury piece by VELORA.';
        }
      }
    });

    // 3. Collection Cards & Shop by Room / Lookbook media
    document.querySelectorAll('.collection-card').forEach(card => {
      const link = card.querySelector('a[href*="cat="]');
      const href = link ? link.getAttribute('href') : '';
      const match = href.match(/cat=([^&]+)/);
      const cat = match ? decodeURIComponent(match[1]).toLowerCase() : '';
      const matching = cat ? products.filter(p => String(p.category || '').toLowerCase() === cat) : products;

      const countPill = card.querySelector('.collection-badge, .piece-count, span');
      if (countPill && /PIECES/i.test(countPill.textContent)) {
        countPill.textContent = matching.length === 1 ? '1 PIECE' : `${matching.length} PIECES`;
      }
      const priceSpan = Array.from(card.querySelectorAll('span, p')).find(el => /FROM\s*₹/i.test(el.textContent));
      if (priceSpan) {
        if (matching.length > 0) {
          const minPrice = Math.min(...matching.map(m => Number(m.price) || 0));
          priceSpan.textContent = `FROM ${fmt(minPrice)}`;
          const img = card.querySelector('img');
          if (img && matching[0].image) img.src = matching[0].image;
        } else if (products.length === 1 && primary.image) {
          priceSpan.textContent = 'COMING SOON';
        }
      }
    });

    // 4. Bottom Editorial / Lookbook gallery images when catalog has single product
    if (products.length === 1 && primary.image) {
      document.querySelectorAll('img[src*="product-1"], img[src*="product-3"], img[src*="product-4"], img[src*="product-5"]').forEach(img => {
        if (img.id !== 'qvImage') {
          img.src = primary.image;
          img.alt = primary.name;
        }
      });
    }
  }

  window.addEventListener('velora:catalog-updated', applySync);
  document.addEventListener('DOMContentLoaded', () => setTimeout(applySync, 350));
  setTimeout(applySync, 1000);
  setTimeout(applySync, 2200);
})();
