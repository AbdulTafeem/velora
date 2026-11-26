(function () {
  var formatINR = function (amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  function calculateBilling(items, discountRate, taxRate) {
    var rateDiscount = typeof discountRate === 'number' ? discountRate : 0;
    var rateTax = typeof taxRate === 'number' ? taxRate : 0.18;
    var safeItems = Array.isArray(items) ? items : [];
    var subtotal = safeItems.reduce(function (sum, item) {
      return sum + (Number(item.price) || 0) * (Number(item.qty) || 1);
    }, 0);
    var discount = Math.round(subtotal * rateDiscount);
    var grandTotal = Math.max(0, subtotal - discount);
    var taxableValue = +(grandTotal / (1 + rateTax)).toFixed(2);
    var totalTax = +(grandTotal - taxableValue).toFixed(2);
    var halfTax = +(totalTax / 2).toFixed(2);

    return {
      subtotal: subtotal,
      discount: discount,
      taxableValue: taxableValue,
      totalTax: totalTax,
      halfTax: halfTax,
      grandTotal: grandTotal
    };
  }

  function completeOrderAndResetCart(orderRecord) {
    try {
      var existing = JSON.parse(localStorage.getItem('velora_orders') || '[]');
      existing.unshift(orderRecord);
      localStorage.setItem('velora_orders', JSON.stringify(existing.slice(0, 25)));
    } catch (err) {}

    if (window.VeloraCart && typeof window.VeloraCart.clear === 'function') {
      window.VeloraCart.clear();
    } else {
      try {
        localStorage.setItem('velora_cart', '[]');
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}
    }
  }

  window.VeloraBilling = {
    formatINR: formatINR,
    calculateBilling: calculateBilling,
    completeOrderAndResetCart: completeOrderAndResetCart
  };
})();

window.VeloraBilling.openInvoiceModal = function(o){ var d = document.getElementById('veloraReceiptBox') || document.createElement('div'); d.id = 'veloraReceiptBox'; d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px'; var id = (o && o.orderId) || 'VEL-ORDER'; var tot = formatINR((o && o.grandTotal) || 0); d.innerHTML = '<div style="background:#fff;color:#140508;padding:20px;border-radius:8px;max-width:420px;width:100%"><h3>VELORA Receipt</h3><p>Order ID: <b>' + id + '</b></p><p>Grand Total: <b>' + tot + '</b></p><button id="vcP">Print</button> <button id="vcC">Close</button></div>'; document.body.appendChild(d); d.querySelector('#vcP').onclick = function(){ window.print(); }; d.querySelector('#vcC').onclick = function(){ d.remove(); }; };


