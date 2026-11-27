/* ==========================================================================
   VELORA — SINGLE SOURCE OF TRUTH: STORE, CART STATE & TOTALS ENGINE (js/store.js)
   ========================================================================== */
(function (window) {
  'use strict';

  const STORAGE_KEY = 'velora_store_v1';
  const LEGACY_CART_KEY = 'velora_cart';
  const WISHLIST_KEY = 'velora_wishlist';
  const VALID_PROMOS = {
    VELORA10: 0.10
  };

  function formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  function escapeHtml(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeCategory(cat) {
    const slug = String(cat || '').trim().toLowerCase();
    const map = {
      'clothes-racks': 'clothes-rack',
      'clothes-rack': 'clothes-rack',
      'storage-racks': 'storage-rack',
      'storage-rack': 'storage-rack',
      'shoe-racks': 'shoe-rack',
      'shoe-rack': 'shoe-rack',
      'shoe & valet racks': 'shoe-rack',
      'wall-shelves': 'wall-shelf',
      'wall-shelf': 'wall-shelf',
      'wall shelves': 'wall-shelf',
      'stools': 'stool',
      'stool': 'stool',
      'metal stools': 'stool',
      'decor': 'decor',
      'wall lighting & decor': 'decor',
      'home decor & tealight stands': 'decor'
    };
    return map[slug] || slug;
  }

  function getFinishSwatchStyle(finishName) {
    const f = String(finishName || '').toLowerCase();
    if (f.includes('gold') || f.includes('champagne') || f.includes('brass')) return 'background:linear-gradient(135deg,#f3e5ab,#d4af37);';
    if (f.includes('silver') || f.includes('chrome') || f.includes('steel')) return 'background:linear-gradient(135deg,#f8fafc,#94a3b8);';
    if (f.includes('teak') || f.includes('walnut') || f.includes('wood')) return 'background:linear-gradient(135deg,#8b5a2b,#3e2723);';
    if (f.includes('maroon')) return 'background:linear-gradient(135deg,#5a0b18,#2b050b);';
    if (f.includes('olive')) return 'background:linear-gradient(135deg,#4d5d3b,#2c3621);';
    return 'background:linear-gradient(135deg,#27272a,#09090b);';
  }

  function renderProductCard(product, opts) {
    const options = opts || {};
    const wishlist = getWishlist();
    const isWishlisted = typeof options.isWishlisted === 'boolean' ? options.isWishlisted : wishlist.includes(product.id);
    const badgeText = options.overrideBadge || product.badge;
    const badgeClass = !options.overrideBadge && product.badgeType === 'maroon' ? 'badge-shimmer badge-maroon' : 'badge-shimmer';
    const mrpVal = product.mrp || product.originalPrice;
    const finishes = Array.isArray(product.finishes) ? product.finishes : [];

    return `
      <article class="product-card" data-product-id="${escapeHtml(product.id)}">
        <div class="product-media">
          <div class="product-top-bar">
            <span class="${badgeClass}">${escapeHtml(badgeText)}</span>
            <button type="button" class="wishlist-btn ${isWishlisted ? 'is-wishlisted' : ''}" data-wish="${escapeHtml(product.id)}" aria-label="Save ${escapeHtml(product.name)} to wishlist">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
          <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-media-link" aria-label="View ${escapeHtml(product.name)}">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-img-main" onerror="this.src='assets/images/product-1.jpg'" loading="lazy" />
            <img src="${escapeHtml(product.hoverImage)}" alt="${escapeHtml(product.name)} alternate view" class="product-img-hover" loading="lazy" />
          </a>
          <div class="product-quick-actions">
            <button type="button" class="btn-quick-view" data-qv="${escapeHtml(product.id)}">Quick View</button>
          </div>
        </div>
        <div class="product-body">
          <div class="product-meta-row">
            <span class="product-room-tag">${escapeHtml(product.room)} &bull; ${finishes.length} Finishes</span>
            <span class="product-mini-swatches" aria-hidden="true">
              ${finishes.map((f) => `<span class="mini-swatch" title="${escapeHtml(f)}" style="${getFinishSwatchStyle(f)}"></span>`).join('')}
            </span>
          </div>
          <h3 class="product-title"><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
          <div class="product-footer-row">
            <div class="product-price-box">
              <span class="price-now">${formatINR(product.price)}</span>
              ${mrpVal ? `<span class="price-mrp">${formatINR(mrpVal)}</span>` : ''}
            </div>
            ${product.stock === 0
              ? '<button type="button" class="btn-add-cart" disabled style="opacity:0.5;cursor:not-allowed;">Sold Out</button>'
              : `<button type="button" class="btn-add-cart" data-add="${escapeHtml(product.id)}">Add to Cart</button>`}
          </div>
        </div>
      </article>
    `;
  }

  function renderSkeletonCards(count) {
    const n = count || 6;
    let html = '';
    for (let i = 0; i < n; i++) {
      html += `
        <article class="product-card" aria-hidden="true" style="opacity:0.65;">
          <div class="product-media" style="background:rgba(212,175,55,0.08);min-height:260px;"></div>
          <div class="product-body">
            <div style="height:12px;width:45%;background:rgba(212,175,55,0.14);border-radius:3px;margin-bottom:10px;"></div>
            <div style="height:18px;width:85%;background:rgba(212,175,55,0.18);border-radius:3px;margin-bottom:14px;"></div>
            <div style="height:34px;width:100%;background:rgba(212,175,55,0.12);border-radius:3px;"></div>
          </div>
        </article>
      `;
    }
    return html;
  }

  function renderCatalogError(message) {
    return `
      <div style="grid-column:1/-1;text-align:center;padding:3rem 1.25rem;border:1px solid rgba(212,175,55,0.3);border-radius:8px;background:rgba(20,5,8,0.45);">
        <h3 style="margin-bottom:0.5rem;">Unable to Load Live Collection</h3>
        <p style="font-size:0.9rem;opacity:0.8;margin-bottom:1.25rem;">${escapeHtml(message || 'Please check your internet connection and try again.')}</p>
        <button type="button" class="btn-magnetic btn-maroon" onclick="window.reloadVeloraCatalog && window.reloadVeloraCatalog()"><span class="btn-text">Retry Loading Catalog</span></button>
      </div>
    `;
  }

  function getCatalog() {
    return Array.isArray(window.VELORA_PRODUCTS) ? window.VELORA_PRODUCTS : [];
  }

  function getProductById(id) {
    return getCatalog().find((p) => p.id === id) || null;
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            items: Array.isArray(parsed.items) ? parsed.items : [],
            promoCode: typeof parsed.promoCode === 'string' ? parsed.promoCode.toUpperCase() : ''
          };
        }
      }
      const legacyRaw = localStorage.getItem(LEGACY_CART_KEY);
      const legacyItems = legacyRaw ? JSON.parse(legacyRaw) : [];
      if (Array.isArray(legacyItems) && legacyItems.length > 0) {
        const migrated = { items: legacyItems, promoCode: '' };
        writeState(migrated);
        return migrated;
      }
    } catch (err) {}
    return { items: [], promoCode: '' };
  }

  function writeState(state) {
    const clean = {
      items: Array.isArray(state.items) ? state.items : [],
      promoCode: typeof state.promoCode === 'string' ? state.promoCode.trim().toUpperCase() : ''
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(clean.items));
    } catch (err) {}
    return clean;
  }

  function getHydratedItems() {
    const state = readState();
    return state.items
      .map((entry) => {
        const qty = Math.max(1, Number(entry.qty) || 1);
        const liveProd = getProductById(entry.id);
        return {
          id: entry.id,
          name: liveProd ? liveProd.name : (entry.name || 'VELORA Piece'),
          price: liveProd ? Number(liveProd.price) : (Number(entry.price) || 0),
          image: liveProd ? liveProd.image : (entry.image || 'assets/images/product-1.jpg'),
          finish: entry.finish || (liveProd && liveProd.finishes ? liveProd.finishes[0] : 'Standard'),
          qty
        };
      })
      .filter((it) => it.id && it.qty > 0);
  }

  function calculateTotals() {
    const state = readState();
    const items = getHydratedItems();
    const totalQty = items.reduce((sum, it) => sum + it.qty, 0);
    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const code = state.promoCode && VALID_PROMOS[state.promoCode] ? state.promoCode : '';
    const rate = code ? VALID_PROMOS[code] : 0;
    const discount = subtotal > 0 ? Math.round(subtotal * rate) : 0;
    const grandTotal = Math.max(0, subtotal - discount);
    const taxableValue = +(grandTotal / 1.18).toFixed(2);
    const totalGst = +(grandTotal - taxableValue).toFixed(2);
    const cgst = +(totalGst / 2).toFixed(2);
    const sgst = +(totalGst - cgst).toFixed(2);

    return {
      items,
      totalQty,
      promoCode: code,
      hasPromo: Boolean(code && discount > 0),
      subtotal,
      discount,
      grandTotal,
      taxableValue,
      totalGst,
      cgst,
      sgst
    };
  }

  function addItem(productId, chosenFinish) {
    const product = getProductById(productId);
    if (!product || product.stock === 0) return null;
    const finish = chosenFinish || (product.finishes && product.finishes[0]) || 'Standard';
    const state = readState();
    const existing = state.items.find((i) => i.id === productId && i.finish === finish);
    if (existing) {
      existing.qty = (Number(existing.qty) || 1) + 1;
    } else {
      state.items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        finish,
        qty: 1
      });
    }
    writeState(state);
    return product;
  }

  function updateItemQty(index, delta) {
    const state = readState();
    if (!state.items[index]) return;
    state.items[index].qty = (Number(state.items[index].qty) || 1) + delta;
    if (state.items[index].qty <= 0) {
      state.items.splice(index, 1);
    }
    writeState(state);
  }

  function removeItem(index) {
    const state = readState();
    state.items.splice(index, 1);
    writeState(state);
  }

  function clearCart() {
    writeState({ items: [], promoCode: '' });
  }

  function applyPromoCode(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase();
    if (!VALID_PROMOS[code]) {
      return { ok: false, code: '' };
    }
    const state = readState();
    state.promoCode = code;
    writeState(state);
    return { ok: true, code };
  }

  function getWishlist() {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function toggleWishlist(id) {
    const list = getWishlist();
    const exists = list.includes(id);
    const next = exists ? list.filter((x) => x !== id) : list.concat(id);
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    } catch (err) {}
    return { list: next, added: !exists };
  }

  window.formatINR = formatINR;
  window.escapeHtml = escapeHtml;
  window.VeloraStore = {
    formatINR,
    escapeHtml,
    normalizeCategory,
    getFinishSwatchStyle,
    renderProductCard,
    renderSkeletonCards,
    renderCatalogError,
    getCatalog,
    getProductById,
    readState,
    calculateTotals,
    addItem,
    updateItemQty,
    removeItem,
    clearCart,
    applyPromoCode,
    getWishlist,
    toggleWishlist
  };
})(window);

