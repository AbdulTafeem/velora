/* ==========================================================================
   VELORA — E-COMMERCE STORE, CART, QUICK-VIEW & WHATSAPP ENGINE (js/cart.js)
   ========================================================================== */
(function () {
  'use strict';

  const Store = window.VeloraStore;
  const formatINR = Store.formatINR;
  const escapeHtml = Store.escapeHtml;
  const WHATSAPP_NUMBER = '918284029319';

  let activeCategory = 'all';
  let searchQuery = '';
  let activeQvProduct = null;
  let activeQvFinish = '';
  let lastFocusedEl = null;

  const productsGrid = document.getElementById('productsGrid');
  const cartDrawer = document.getElementById('cartDrawer');
  const quickViewModal = document.getElementById('quickViewModal');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartCountEl = document.getElementById('cartCount');
  const drawerBagCountEl = document.getElementById('drawerBagCount');
  const wishlistCountEl = document.getElementById('wishlistCount');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartDiscountEl = document.getElementById('cartDiscount');
  const discountRowEl = document.getElementById('discountRow');
  const cartGrandTotalEl = document.getElementById('cartGrandTotal');
  const toastEl = document.getElementById('veloraToast');

  function lockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
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

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('is-visible'), 2800);
  }

  
  function renderProducts() {
    if (!productsGrid) return;
    const catState = window.VELORA_CATALOG_STATE || { status: 'ready' };
    if (catState.status === 'loading') {
      productsGrid.innerHTML = Store.renderSkeletonCards(6);
      return;
    }
    if (catState.status === 'error') {
      productsGrid.innerHTML = Store.renderCatalogError(catState.error);
      return;
    }

    const catalog = Store.getCatalog();
    if (!catalog.length) {
      productsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--ink-muted);">No products available right now.</div>';
      return;
    }

    const wishlist = Store.getWishlist();
    const targetSlug = activeCategory === 'all' ? 'all' : Store.normalizeCategory(activeCategory);

    const filtered = catalog.filter((p) => {
      const prodSlug = Store.normalizeCategory(p.category);
      const matchCat = targetSlug === 'all' || prodSlug === targetSlug;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        prodSlug.includes(q) ||
        String(p.room || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      productsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--ink-muted);">No products matched your filter. Try resetting to "All Pieces".</div>';
      return;
    }

    productsGrid.innerHTML = filtered
      .map((product) => Store.renderProductCard(product, { isWishlisted: wishlist.includes(product.id) }))
      .join('');
  }

  function addToCart(productId, chosenFinish) {
    const product = Store.addItem(productId, chosenFinish);
    if (!product) return;
    renderCart();
    openCart();
    showToast(`Added "${product.name}" to your bag`);
  }

  function updateQty(index, delta) {
    Store.updateItemQty(index, delta);
    renderCart();
  }

  function removeCartItem(index) {
    Store.removeItem(index);
    renderCart();
  }

  function renderCart() {
    const totals = Store.calculateTotals();
    const wishlist = Store.getWishlist();

    if (cartCountEl) cartCountEl.textContent = totals.totalQty;
    if (drawerBagCountEl) drawerBagCountEl.textContent = totals.totalQty;
    if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;

    const promoInput = document.getElementById('promoCodeInput');
    if (promoInput && totals.promoCode && !promoInput.value) {
      promoInput.value = totals.promoCode;
    }

    if (!cartItemsContainer) return;

    if (totals.items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <h4>Your Velvet Bag is Empty</h4>
          <p style="font-size:0.85rem;margin-bottom:1.25rem;">Explore our garment racks, Solid Wood stands, and wall shelves.</p>
          <button type="button" class="btn-magnetic btn-maroon" id="emptyExploreBtn"><span class="btn-text">Explore Collection</span></button>
        </div>
      `;
      const emptyBtn = document.getElementById('emptyExploreBtn');
      if (emptyBtn) emptyBtn.addEventListener('click', closeAllOverlays);
    } else {
      cartItemsContainer.innerHTML = totals.items
        .map(
          (item, idx) => `
          <div class="cart-line-item">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
            <div class="cart-line-info">
              <div class="cart-line-top">
                <div>
                  <a href="product.html?id=${encodeURIComponent(item.id)}" class="cart-line-title">${escapeHtml(item.name)}</a>
                  <div class="cart-line-finish">Finish: ${escapeHtml(item.finish)}</div>
                </div>
                <button type="button" class="cart-remove-btn" data-remove="${idx}">Remove</button>
              </div>
              <div class="cart-line-bottom">
                <div class="qty-stepper">
                  <button type="button" data-qty-idx="${idx}" data-delta="-1" aria-label="Decrease quantity">&minus;</button>
                  <span>${item.qty}</span>
                  <button type="button" data-qty-idx="${idx}" data-delta="1" aria-label="Increase quantity">+</button>
                </div>
                <strong>${formatINR(item.price * item.qty)}</strong>
              </div>
            </div>
          </div>
        `
        )
        .join('');
    }

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatINR(totals.subtotal);
    if (discountRowEl) discountRowEl.style.display = totals.hasPromo ? 'flex' : 'none';
    if (cartDiscountEl) cartDiscountEl.textContent = '-' + formatINR(totals.discount);
    if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatINR(totals.grandTotal);
  }

  function openCart() {
    if (!cartDrawer) return;
    lastFocusedEl = document.activeElement;
    quickViewModal?.classList.remove('is-open');
    quickViewModal?.setAttribute('aria-hidden', 'true');
    mobileDrawer?.classList.remove('is-open');
    mobileDrawer?.setAttribute('aria-hidden', 'true');

    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop?.classList.add('is-visible');
    lockScroll();
    document.getElementById('cartCloseBtn')?.focus();
  }

  function openQuickView(productId) {
    const p = Store.getProductById(productId);
    if (!p || !quickViewModal) return;
    lastFocusedEl = document.activeElement;
    activeQvProduct = p;
    activeQvFinish = p.finishes[0];

    document.getElementById('qvImage').src = p.image;
    document.getElementById('qvImage').alt = p.name;
    document.getElementById('qvBadge').textContent = p.badge;
    document.getElementById('qvTitle').textContent = p.name;
    document.getElementById('qvPrice').textContent = formatINR(p.price);
    const qvMrpEl = document.getElementById('qvMrp');
    if (qvMrpEl) qvMrpEl.textContent = p.mrp ? formatINR(p.mrp) : '';
    document.getElementById('qvDesc').textContent = p.description;
    document.getElementById('qvDimensions').textContent = 'Dimensions: ' + p.dimensions;

    const finishesEl = document.getElementById('qvFinishes');
    finishesEl.innerHTML = p.finishes
      .map((f, idx) => `<button type="button" class="qv-finish-btn ${idx === 0 ? 'is-active' : ''}" data-qv-finish="${escapeHtml(f)}"><span class="finish-swatch-dot" style="${getFinishSwatchStyle(f)}"></span>${escapeHtml(f)}</button>`)
      .join('');

    quickViewModal.classList.add('is-open');
    quickViewModal.setAttribute('aria-hidden', 'false');
    drawerBackdrop?.classList.add('is-visible');
    lockScroll();
    document.getElementById('qvCloseBtn')?.focus();
  }

  function closeAllOverlays() {
    cartDrawer?.classList.remove('is-open');
    cartDrawer?.setAttribute('aria-hidden', 'true');
    quickViewModal?.classList.remove('is-open');
    quickViewModal?.setAttribute('aria-hidden', 'true');
    mobileDrawer?.classList.remove('is-open');
    mobileDrawer?.setAttribute('aria-hidden', 'true');
    document.getElementById('mobileMenuBtn')?.setAttribute('aria-expanded', 'false');
    drawerBackdrop?.classList.remove('is-visible');
    unlockScroll();
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
      lastFocusedEl = null;
    }
  }

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      addToCart(addBtn.dataset.add);
      return;
    }
    const wishBtn = e.target.closest('[data-wish]');
    if (wishBtn) {
      const res = Store.toggleWishlist(wishBtn.dataset.wish);
      showToast(res.added ? 'Saved to your Velora Wishlist' : 'Removed from Wishlist');
      renderProducts();
      renderCart();
      return;
    }
    const qvBtn = e.target.closest('[data-qv]');
    if (qvBtn) {
      openQuickView(qvBtn.dataset.qv);
      return;
    }
    const qvFinishBtn = e.target.closest('[data-qv-finish]');
    if (qvFinishBtn) {
      activeQvFinish = qvFinishBtn.dataset.qvFinish;
      document.querySelectorAll('.qv-finish-btn').forEach((b) => b.classList.remove('is-active'));
      qvFinishBtn.classList.add('is-active');
      return;
    }
    const qtyBtn = e.target.closest('[data-qty-idx]');
    if (qtyBtn) {
      updateQty(Number(qtyBtn.dataset.qtyIdx), Number(qtyBtn.dataset.delta));
      return;
    }
    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) {
      removeCartItem(Number(removeBtn.dataset.remove));
      return;
    }
    const filterTrigger = e.target.closest('[data-filter]');
    if (filterTrigger) {
      activeCategory = filterTrigger.dataset.filter;
      document.querySelectorAll('.filter-tab').forEach((tab) => {
        tab.classList.toggle('is-active', tab.dataset.filter === activeCategory);
      });
      renderProducts();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.querySelector('#veloraCheckoutModal.is-open, #veloraInvoiceModal.is-open')) return;
      closeAllOverlays();
    }
  });

  let showingWishlistOnly = false;
  function renderWishlistView() {
    const wishlist = Store.getWishlist();
    const saved = Store.getCatalog().filter((p) => wishlist.includes(p.id));
    if (!saved.length) { showingWishlistOnly = false; renderProducts(); return; }
    if (productsGrid) productsGrid.innerHTML = saved.map((product) => Store.renderProductCard(product, { isWishlisted: true, overrideBadge: 'Saved' })).join('');
  }
  document.getElementById('wishlistOpenBtn')?.addEventListener('click', () => {
    const wishlist = Store.getWishlist();
    if (wishlist.length === 0) {
      showToast('Your Wishlist is empty. Tap the heart icon on any product to save it.');
      return;
    }
    showingWishlistOnly = !showingWishlistOnly;
    if (showingWishlistOnly && productsGrid) {
      const saved = Store.getCatalog().filter((p) => wishlist.includes(p.id));
      productsGrid.innerHTML = saved
        .map((product) => Store.renderProductCard(product, { isWishlisted: true, overrideBadge: 'Saved' }))
        .join('');
      document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`Showing ${saved.length} saved Wishlist item(s). Tap heart again to show all.`);
    } else {
      renderProducts();
      showToast('Showing all products');
    }
  });

  document.getElementById('cartOpenBtn')?.addEventListener('click', openCart);
  document.getElementById('cartCloseBtn')?.addEventListener('click', closeAllOverlays);
  document.getElementById('qvCloseBtn')?.addEventListener('click', closeAllOverlays);
  drawerBackdrop?.addEventListener('click', closeAllOverlays);

  document.getElementById('qvAddToCartBtn')?.addEventListener('click', () => {
    if (activeQvProduct) addToCart(activeQvProduct.id, activeQvFinish);
  });

  document.getElementById('applyPromoBtn')?.addEventListener('click', () => {
    const code = document.getElementById('promoCodeInput')?.value || '';
    const res = Store.applyPromoCode(code);
    if (res.ok) {
      renderCart();
      showToast(`Code ${res.code} applied! 10% privilege unlocked.`);
    } else {
      showToast('Invalid code. Try VELORA10 for 10% OFF.');
    }
  });

  document.getElementById('whatsappCheckoutBtn')?.addEventListener('click', () => {
    const totals = Store.calculateTotals();
    if (totals.items.length === 0) {
      showToast('Please add at least one piece to your bag first.');
      return;
    }
    const lines = totals.items.map((item, i) => `${i + 1}. ${item.name} (${item.finish}) x${item.qty} - ${formatINR(item.price * item.qty)}`);
    const promoLine = totals.hasPromo ? `\n*Promo (${totals.promoCode}):* -${formatINR(totals.discount)}` : '';
    const msg = `*VELORA — New Order Request*\n\n${lines.join('\n')}${promoLine}\n\n*Total:* ${formatINR(totals.grandTotal)}\n*Shipping:* Free Insured Pan-India Delivery\n\n*Delivery Details (Please fill):*\n• Name: \n• City & Pincode: \n• Payment Mode (UPI / COD): `;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  });

  document.getElementById('expressCheckoutBtn')?.addEventListener('click', () => {
    showToast('Pay via UPI / COD online checkout coming soon — please Order via WhatsApp above.');
  });

  // Single source of truth for Spotlight product, finishes, Add to Bag, and WhatsApp order
  function getSpotlightProduct() {
    const btn = document.getElementById('spotlightAddBtn');
    const liveId = btn && btn.dataset ? btn.dataset.id : '';
    return (liveId && Store.getProductById(liveId)) || Store.getCatalog()[0] || null;
  }

  function syncSpotlightFinishes() {
    const spotProd = getSpotlightProduct();
    const pillsWrap = document.getElementById('spotlightFinishPills');
    const selectedLabel = document.getElementById('selectedSpotlightFinish');
    if (!spotProd || !pillsWrap || !Array.isArray(spotProd.finishes) || !spotProd.finishes.length) return;
    pillsWrap.innerHTML = spotProd.finishes
      .map((f, i) => `<button type="button" class="finish-pill ${i === 0 ? 'is-active' : ''}" data-finish="${escapeHtml(f)}">${escapeHtml(f)}</button>`)
      .join('');
    spotlightFinish = spotProd.finishes[0];
    if (selectedLabel) selectedLabel.textContent = spotlightFinish;
  }

  let spotlightFinish = 'Brushed Silver';
  syncSpotlightFinishes();
  window.addEventListener('velora:catalogUpdated', syncSpotlightFinishes);

  document.getElementById('spotlightFinishPills')?.addEventListener('click', (e) => {
    const pill = e.target.closest('[data-finish]');
    if (!pill) return;
    spotlightFinish = pill.dataset.finish;
    const selectedLabel = document.getElementById('selectedSpotlightFinish');
    if (selectedLabel) selectedLabel.textContent = spotlightFinish;
    document.querySelectorAll('#spotlightFinishPills .finish-pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');
  });

  document.getElementById('spotlightAddBtn')?.addEventListener('click', () => {
    const liveSpot = getSpotlightProduct();
    if (liveSpot) addToCart(liveSpot.id, spotlightFinish);
  });

  document.getElementById('spotlightWaBtn')?.addEventListener('click', () => {
    const spotProd = getSpotlightProduct();
    if (!spotProd) return;
    const msg = `*VELORA — Direct Order Request*\n\n1. ${spotProd.name} (${spotlightFinish}) x1 - ${formatINR(spotProd.price)}\n\n*Total:* ${formatINR(spotProd.price)}\n*Shipping:* Free Insured Pan-India Delivery\n\n*Delivery Details (Please fill):*\n• Name: \n• City & Pincode: \n• Payment Mode (UPI / COD): `;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  });

  document.getElementById('liveSearchInput')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  window.VeloraCart = {
    add: addToCart,
    open: openCart,
    close: closeAllOverlays,
    render: renderCart,
    clear: () => {
      Store.clearCart();
      renderCart();
    }
  };

  window.addEventListener('velora:catalogLoading', renderProducts);
  window.addEventListener('velora:catalogError', renderProducts);
  window.addEventListener('velora:catalogUpdated', () => {
    syncSpotlightFinishes();
    renderProducts();
    renderCart();
  });
  window.addEventListener('storage', () => renderCart());

  renderProducts();
  renderCart();
})();




