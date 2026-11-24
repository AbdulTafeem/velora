/* ==========================================================================
   VELORA — E-COMMERCE STORE, CART, QUICK-VIEW & WHATSAPP ENGINE (js/cart.js)
   ========================================================================== */
(function () {
  const WHATSAPP_NUMBER = '919876543210'; // Replace with your business WhatsApp number

  function safeReadStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  let cart = safeReadStorage('velora_cart');
  let wishlist = safeReadStorage('velora_wishlist');
  let promoApplied = false;
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
    document.body.style.overflow = 'hidden';
    if (window.VeloraLenis && typeof window.VeloraLenis.stop === 'function') {
      window.VeloraLenis.stop();
    }
  }

  function unlockScroll() {
    document.body.style.overflow = '';
    if (window.VeloraLenis && typeof window.VeloraLenis.start === 'function') {
      window.VeloraLenis.start();
    }
  }

      function formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
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

  function saveState() {
    try {
      localStorage.setItem('velora_cart', JSON.stringify(cart));
      localStorage.setItem('velora_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      // Ignore storage errors in private mode
    }
  }

  function renderProducts() {
    if (!productsGrid || typeof VELORA_PRODUCTS === 'undefined') return;

    const filtered = VELORA_PRODUCTS.filter((p) => {
      const matchCat = activeCategory === 'all' || (p.category === activeCategory || p.category.replace(/s$/, "") === activeCategory.replace(/s$/, ""));
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.room.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      productsGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--ink-muted);">No products matched your filter. Try resetting to "All Pieces".</div>`;
      return;
    }

    productsGrid.innerHTML = filtered
      .map((product) => {
        const isWishlisted = wishlist.includes(product.id);
        const badgeClass = product.badgeType === 'maroon' ? 'badge-shimmer badge-maroon' : 'badge-shimmer';
        return `
          <article class="product-card" data-product-id="${product.id}" data-cursor="view">
            <div class="product-media">
              <div class="product-top-bar">
                <span class="${badgeClass}">${product.badge}</span>
                <button type="button" class="wishlist-btn ${isWishlisted ? 'is-wishlisted' : ''}" data-wish="${product.id}" aria-label="Save ${product.name} to wishlist">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <a href="product.html?id=${product.id}" class="product-media-link" aria-label="View ${product.name}">
                <img src="${product.image}" alt="${product.name}" class="product-img-main" loading="lazy" />
                <img src="${product.hoverImage}" alt="${product.name} alternate view" class="product-img-hover" loading="lazy" />
              </a>
              <div class="product-quick-actions">
                <button type="button" class="btn-quick-view" data-qv="${product.id}">Quick View</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-meta-row">
                <span class="product-room-tag">${product.room} &bull; ${product.finishes.length} Finishes</span>
                <span class="product-mini-swatches" aria-hidden="true">
                  ${product.finishes.map((f) => `<span class="mini-swatch" title="${f}" style="${getFinishSwatchStyle(f)}"></span>`).join('')}
                </span>
              </div>
              <h3 class="product-title"><a href="product.html?id=${product.id}">${product.name}</a></h3>
              <div class="product-footer-row">
                <div class="product-price-box">
                  <span class="price-now">${formatINR(product.price)}</span>
                  ${(product.mrp || product.originalPrice) ? `<span class="price-mrp">${formatINR((product.mrp || product.originalPrice))}</span>` : ""}
                </div>
                <button type="button" class="btn-add-cart" data-add="${product.id}">Add to Cart</button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

        if (typeof gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(
        productsGrid.querySelectorAll('.product-card'),
        { y: 22, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
    }
    if (typeof window.bindVeloraCardTilt === 'function') {
      window.bindVeloraCardTilt();
    }
  }

  function addToCart(productId, chosenFinish) {
    if (typeof VELORA_PRODUCTS === 'undefined') return;
    const product = VELORA_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    const finish = chosenFinish || product.finishes[0];
    const existing = cart.find((item) => item.id === productId && item.finish === finish);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, finish, qty: 1 });
    }
    saveState();
    renderCart();
    openCart();
    showToast(`Added "${product.name}" to your bag`);
  }

  function updateQty(index, delta) {
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveState();
    renderCart();
  }

  function removeCartItem(index) {
    cart.splice(index, 1);
    saveState();
    renderCart();
  }

  function renderCart() {
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalQty;
    if (drawerBagCountEl) drawerBagCountEl.textContent = totalQty;
    if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
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
      cartItemsContainer.innerHTML = cart
        .map(
          (item, idx) => `
          <div class="cart-line-item">
            <img src="${item.image}" alt="${item.name}" />
            <div class="cart-line-info">
              <div class="cart-line-top">
                <div>
                  <a href="product.html?id=${item.id}" class="cart-line-title">${item.name}</a>
                  <div class="cart-line-finish">Finish: ${item.finish}</div>
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

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
    const grandTotal = Math.max(0, subtotal - discount);

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatINR(subtotal);
    if (discountRowEl) discountRowEl.style.display = promoApplied && subtotal > 0 ? 'flex' : 'none';
    if (cartDiscountEl) cartDiscountEl.textContent = '-' + formatINR(discount);
    if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatINR(grandTotal);
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
    if (typeof VELORA_PRODUCTS === 'undefined' || !quickViewModal) return;
    const p = VELORA_PRODUCTS.find((item) => item.id === productId);
    if (!p) return;
    lastFocusedEl = document.activeElement;
    activeQvProduct = p;
    activeQvFinish = p.finishes[0];

    document.getElementById('qvImage').src = p.image;
    document.getElementById('qvImage').alt = p.name;
    document.getElementById('qvBadge').textContent = p.badge;
    document.getElementById('qvTitle').textContent = p.name;
    document.getElementById('qvPrice').textContent = formatINR(p.price);
    const qvMrpEl = document.getElementById('qvMrp'); if (qvMrpEl) qvMrpEl.textContent = p.mrp ? formatINR(p.mrp) : '';
    document.getElementById('qvDesc').textContent = p.description;
    document.getElementById('qvDimensions').textContent = 'Dimensions: ' + p.dimensions;

    const finishesEl = document.getElementById('qvFinishes');
    finishesEl.innerHTML = p.finishes
      .map((f, idx) => `<button type="button" class="qv-finish-btn ${idx === 0 ? 'is-active' : ''}" data-qv-finish="${f}"><span class="finish-swatch-dot" style="${getFinishSwatchStyle(f)}"></span>${f}</button>`)
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
      const id = wishBtn.dataset.wish;
      if (wishlist.includes(id)) {
        wishlist = wishlist.filter((item) => item !== id);
        showToast('Removed from Wishlist');
      } else {
        wishlist.push(id);
        showToast('Saved to your Velora Wishlist');
      }
      saveState();
      window.addEventListener('velora:catalogUpdated', () => { renderProducts(); });
    window.addEventListener('load', () => { if (productsGrid && !productsGrid.children.length) renderProducts(); });
  setTimeout(() => { if (productsGrid && !productsGrid.children.length) renderProducts(); }, 600);
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
    if (e.key === 'Escape') closeAllOverlays();
  });

    // Header Wishlist Button Tap (Filters to saved wishlist items or notifies if empty)
  let showingWishlistOnly = false;
  document.getElementById('wishlistOpenBtn')?.addEventListener('click', () => {
    if (wishlist.length === 0) {
      showToast('Your Wishlist is empty. Tap the heart icon on any product to save it.');
      return;
    }
    showingWishlistOnly = !showingWishlistOnly;
    if (showingWishlistOnly && productsGrid && typeof VELORA_PRODUCTS !== 'undefined') {
      const saved = VELORA_PRODUCTS.filter((p) => wishlist.includes(p.id));
      productsGrid.innerHTML = saved
        .map((product) => `
          <article class="product-card" data-product-id="${product.id}" data-cursor="view">
            <div class="product-media">
              <div class="product-top-bar">
                <span class="badge-shimmer">Saved</span>
                <button type="button" class="wishlist-btn is-wishlisted" data-wish="${product.id}" aria-label="Remove from wishlist">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <a href="product.html?id=${product.id}" class="product-media-link" aria-label="View ${product.name}">
                <img src="${product.image}" alt="${product.name}" class="product-img-main" loading="lazy" />
                <img src="${product.hoverImage}" alt="${product.name} alternate view" class="product-img-hover" loading="lazy" />
              </a>
              <div class="product-quick-actions">
                <button type="button" class="btn-quick-view" data-qv="${product.id}">Quick View</button>
              </div>
            </div>
            <div class="product-body">
              <h3 class="product-title"><a href="product.html?id=${product.id}">${product.name}</a></h3>
              <div class="product-footer-row">
                <div class="product-price-box"><span class="price-now">${formatINR(product.price)}</span></div>
                <button type="button" class="btn-add-cart" data-add="${product.id}">Add to Cart</button>
              </div>
            </div>
          </article>
        `)
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
    const code = document.getElementById('promoCodeInput')?.value.trim().toUpperCase();
    if ((code === 'VELORA10' || code === 'VALORA10')) {
      promoApplied = true;
      renderCart();
      showToast('Code VELORA10 applied! 10% privilege unlocked.');
    } else {
      showToast('Invalid code. Try VELORA10 for 10% OFF.');
    }
  });

  document.getElementById('whatsappCheckoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Please add at least one piece to your bag first.');
      return;
    }
    const lines = cart.map((item, i) => `${i + 1}. ${item.name} (${item.finish}) x${item.qty} - ${formatINR(item.price * item.qty)}`);
    const total = cartGrandTotalEl?.textContent || '';
    const msg = `Hello VELORA! I would like to place an order:\n\n${lines.join('\n')}\n\nTotal: ${total}\nShipping: Free Across India`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  document.getElementById('expressCheckoutBtn')?.addEventListener('click', () => {
    showToast('Pay via UPI / COD online checkout coming soon — please Order via WhatsApp above.');
  });

  let spotlightFinish = 'Natural Teak Wood / Noir';
  document.getElementById('spotlightFinishPills')?.addEventListener('click', (e) => {
    const pill = e.target.closest('[data-finish]');
    if (!pill) return;
    spotlightFinish = pill.dataset.finish;
    document.getElementById('selectedSpotlightFinish').textContent = spotlightFinish;
    document.querySelectorAll('#spotlightFinishPills .finish-pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');
  });

  document.getElementById('spotlightAddBtn')?.addEventListener('click', () => {
    addToCart('vel-06', spotlightFinish);
  });

  document.getElementById('spotlightWaBtn')?.addEventListener('click', () => {
    const msg = `Hello VELORA! I want to order the Teak & Solid Wood Base T-Stand (${spotlightFinish}) - ₹7,499.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  document.getElementById('liveSearchInput')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  window.VeloraCart = {
    add: addToCart,
    open: openCart,
    close: closeAllOverlays,
    render: renderCart
  };

  window.addEventListener('velora:catalogUpdated', () => { renderProducts(); });
    window.addEventListener('load', () => { if (productsGrid && !productsGrid.children.length) renderProducts(); });
  setTimeout(() => { if (productsGrid && !productsGrid.children.length) renderProducts(); }, 600);
  renderProducts();
  renderCart();
})();
















