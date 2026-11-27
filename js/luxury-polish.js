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


