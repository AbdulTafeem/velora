/* ==========================================================================
   VELORA — ORDER ARCHIVE SANITIZATION & CART RESET HELPER (js/billing-helpers.js)
   ========================================================================== */
(function (window) {
  'use strict';

  function maskPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 4) return 'Protected';
    return 'XXXXXX' + digits.slice(-4);
  }

  function sanitizeOrderForStorage(orderRecord) {
    const src = orderRecord && typeof orderRecord === 'object' ? orderRecord : {};
    const itemsArr = Array.isArray(src.items) ? src.items : [];
    const cust = src.customer || {};
    return {
      orderId: String(src.orderId || 'VEL-ORDER'),
      createdAt: String(src.orderDate || new Date().toISOString()),
      paymentMethod: String(cust.paymentMode || src.paymentMethod || 'COD / UPI'),
      itemCount: itemsArr.reduce((acc, it) => acc + Math.max(1, Number(it && it.qty) || 1), 0),
      subTotal: Number(src.subtotal || src.subTotal) || 0,
      discountAmount: Number(src.discount || src.discountAmount) || 0,
      taxAmount: Number(src.totalGst || src.taxAmount) || 0,
      grandTotal: Number(src.grandTotal) || 0,
      customerPhoneMasked: maskPhone(cust.phone || src.phone),
      hasDeliveryAddress: Boolean((cust.address || src.address) && String(cust.address || src.address).trim().length > 0)
    };
  }

  function completeOrderAndResetCart(orderRecord) {
    try {
      let existing = JSON.parse(localStorage.getItem('velora_orders') || '[]');
      if (!Array.isArray(existing)) existing = [];
      existing.unshift(sanitizeOrderForStorage(orderRecord));
      localStorage.setItem('velora_orders', JSON.stringify(existing.slice(0, 25)));
    } catch (e) {}

    try {
      if (window.VeloraCart && typeof window.VeloraCart.clear === 'function') {
        window.VeloraCart.clear();
      } else if (window.VeloraStore && typeof window.VeloraStore.clearCart === 'function') {
        window.VeloraStore.clearCart();
      } else {
        localStorage.removeItem('velora_store_v1');
        localStorage.setItem('velora_cart', '[]');
      }
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  }

  window.VeloraBilling = {
    completeOrderAndResetCart
  };
})(window);
