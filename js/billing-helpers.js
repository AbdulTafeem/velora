(function (window) {
  'use strict';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function maskPhone(phone) {
    var digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 4) return 'Protected';
    return 'XXXXXX' + digits.slice(-4);
  }

  function calculateBilling(items, discountRate, taxRate) {
    var safeItems = Array.isArray(items) ? items : [];
    var subTotal = safeItems.reduce(function (sum, item) {
      var price = Number(item && item.price) || 0;
      var qty = Math.max(1, Number(item && item.qty) || 1);
      return sum + price * qty;
    }, 0);
    var discRate = Number(discountRate) || 0;
    var gstRate = Number(taxRate) || 0;
    var discountAmount = Math.round(subTotal * discRate);
    var taxableAmount = Math.max(0, subTotal - discountAmount);
    var taxAmount = Math.round(taxableAmount * gstRate);
    var grandTotal = taxableAmount + taxAmount;
    return {
      subTotal: subTotal,
      discountAmount: discountAmount,
      taxableAmount: taxableAmount,
      taxAmount: taxAmount,
      grandTotal: grandTotal
    };
  }

  function sanitizeOrderForStorage(orderRecord) {
    var src = orderRecord && typeof orderRecord === 'object' ? orderRecord : {};
    var itemsArr = Array.isArray(src.items) ? src.items : [];
    return {
      orderId: String(src.orderId || 'VEL-ORDER'),
      createdAt: String(src.createdAt || new Date().toISOString()),
      paymentMethod: String(src.paymentMethod || 'WhatsApp / Assisted'),
      itemCount: itemsArr.reduce(function (acc, it) {
        return acc + Math.max(1, Number(it && it.qty) || 1);
      }, 0),
      subTotal: Number(src.subTotal) || 0,
      discountAmount: Number(src.discountAmount) || 0,
      taxAmount: Number(src.taxAmount) || 0,
      grandTotal: Number(src.grandTotal) || 0,
      customerPhoneMasked: maskPhone(src.phone),
      hasDeliveryAddress: Boolean(src.address && String(src.address).trim().length > 0)
    };
  }

  function completeOrderAndResetCart(orderRecord) {
    try {
      var existing = JSON.parse(localStorage.getItem('velora_orders') || '[]');
      if (!Array.isArray(existing)) existing = [];
      existing.unshift(sanitizeOrderForStorage(orderRecord));
      localStorage.setItem('velora_orders', JSON.stringify(existing.slice(0, 25)));
    } catch (e) {}

    try {
      if (window.VeloraCart && typeof window.VeloraCart.clear === 'function') {
        window.VeloraCart.clear();
      } else {
        localStorage.setItem('velora_cart', '[]');
      }
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {}
  }

  var fmtINR = window.formatINR || function (n) {
    return '₹' + Number(n || 0).toLocaleString('en-IN');
  };

  window.VeloraBilling = {
    calculateBilling: calculateBilling,
    completeOrderAndResetCart: completeOrderAndResetCart,
    __autoModal: false,
    openInvoiceModal: function (o) {
      var existingBox = document.getElementById('veloraReceiptBox');
      if (existingBox) existingBox.remove();

      var d = document.createElement('div');
      d.id = 'veloraReceiptBox';
      d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px';

      var safeId = escapeHtml((o && o.orderId) || 'VEL-ORDER');
      var safeMethod = escapeHtml((o && o.paymentMethod) || 'Standard Order');
      var tot = escapeHtml(fmtINR((o && o.grandTotal) || 0));

      var box = document.createElement('div');
      box.style.cssText = 'background:#fff;color:#140508;padding:20px;border-radius:8px;max-width:420px;width:100%';

      var title = document.createElement('h3');
      title.textContent = 'VELORA Order Summary';

      var idLine = document.createElement('p');
      idLine.innerHTML = 'Order ID: <b>' + safeId + '</b>';

      var payLine = document.createElement('p');
      payLine.innerHTML = 'Mode: <b>' + safeMethod + '</b>';

      var totLine = document.createElement('p');
      totLine.innerHTML = 'Total: <b>' + tot + '</b>';

      var printBtn = document.createElement('button');
      printBtn.id = 'vcP';
      printBtn.type = 'button';
      printBtn.textContent = 'Print';
      printBtn.onclick = function () { window.print(); };

      var closeBtn = document.createElement('button');
      closeBtn.id = 'vcC';
      closeBtn.type = 'button';
      closeBtn.textContent = 'Close';
      closeBtn.onclick = function () { d.remove(); };

      box.appendChild(title);
      box.appendChild(idLine);
      box.appendChild(payLine);
      box.appendChild(totLine);
      box.appendChild(printBtn);
      box.appendChild(closeBtn);
      d.appendChild(box);
      document.body.appendChild(d);
    }
  };
})(window);
