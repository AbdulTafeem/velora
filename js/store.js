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
      'wall-shelves': 'wall-shelf',
      'wall-shelf': 'wall-shelf',
      'stools': 'stool',
      'stool': 'stool',
      'decor': 'decor'
    };
    return map[slug] || slug;
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
      // Migrate legacy cart array once
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
