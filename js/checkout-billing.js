/* ==========================================================================
   VELORA — ONLINE CHECKOUT, ORDER SYNC & ADVANCE GST INVOICE ENGINE
   ========================================================================== */
(function () {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9NZAh4Wm_so6SkhZl8ASyMaVz1EE67Rk_IpPCN_5tve8D3eCR3tJyW6uLEuSOnhRZ/exec';
  const WHATSAPP_NUMBER = '918284029319';
  const RAZORPAY_KEY_ID = '';

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  function escapeHtml(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCartState() {
    let items = [];
    try { items = JSON.parse(localStorage.getItem('velora_cart') || '[]'); } catch (e) {}
    const subtotal = items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
    const promoRow = document.getElementById('cartDiscountRow');
    const hasPromo = promoRow && promoRow.style.display !== 'none';
    const discount = hasPromo ? Math.round(subtotal * 0.10) : 0;
    const grandTotal = Math.max(0, subtotal - discount);
    const taxableValue = +(grandTotal / 1.18).toFixed(2);
    const totalGst = +(grandTotal - taxableValue).toFixed(2);
    return { items, subtotal, discount, grandTotal, taxableValue, totalGst, hasPromo };
  }

  function injectUI() {
    if (document.getElementById('veloraCheckoutModal')) return;
    const style = document.createElement('style');
    style.textContent = `
      .vc-overlay { position:fixed; inset:0; z-index:10050; background:rgba(8,5,6,0.82); backdrop-filter:blur(14px); display:none; align-items:center; justify-content:center; padding:1rem; overflow-y:auto; }
      .vc-overlay.is-open { display:flex !important; }
      .vc-card { width:100%; max-width:760px; max-height:92vh; overflow-y:auto; background:#FFFDF9; color:#120C0E; border:1px solid rgba(212,175,55,0.55); border-radius:8px; box-shadow:0 32px 90px rgba(0,0,0,0.75); }
      .vc-head { background:linear-gradient(135deg,#140508,#3D0712); color:#F8F5EE; padding:1.25rem 1.6rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(212,175,55,0.35); }
      .vc-head h3 { font-family:'Cinzel',serif; letter-spacing:0.14em; font-size:1.05rem; color:#F3E5C0; margin:0; }
      .vc-close { background:none; border:none; color:#F3E5C0; font-size:1.6rem; cursor:pointer; line-height:1; }
      .vc-body { padding:1.5rem 1.6rem; display:grid; gap:1.1rem; }
      .vc-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; }
      .vc-field { display:flex; flex-direction:column; gap:0.32rem; }
      .vc-field label { font-size:0.7rem; font-weight:600; letter-spacing:0.09em; text-transform:uppercase; color:#4E0916; }
      .vc-field input, .vc-field select, .vc-field textarea { padding:0.65rem 0.8rem; border:1px solid rgba(18,12,14,0.18); border-radius:4px; background:#fff; font:inherit; font-size:0.88rem; }
      .vc-field input:focus, .vc-field select:focus, .vc-field textarea:focus { outline:none; border-color:#D4AF37; box-shadow:0 0 0 3px rgba(212,175,55,0.15); }
      .vc-pay-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.65rem; }
      .vc-pay-opt { border:1px solid rgba(18,12,14,0.18); border-radius:5px; padding:0.75rem; cursor:pointer; background:#FAF7F2; transition:all 0.2s; }
      .vc-pay-opt.is-selected { border-color:#540A18; background:rgba(84,10,24,0.06); box-shadow:inset 0 0 0 1px #D4AF37; }
      .vc-pay-opt strong { display:block; font-size:0.8rem; color:#120C0E; }
      .vc-pay-opt span { font-size:0.68rem; color:#5C534E; }
      .vc-summary { background:#F8F5EE; border:1px solid rgba(212,175,55,0.35); border-radius:5px; padding:0.95rem 1.1rem; font-size:0.84rem; display:grid; gap:0.35rem; }
      .vc-row { display:flex; justify-content:space-between; }
      .vc-row.grand { border-top:1px solid rgba(18,12,14,0.12); padding-top:0.45rem; margin-top:0.25rem; font-weight:700; font-size:0.98rem; color:#540A18; }
      .vc-submit { width:100%; padding:0.92rem; background:linear-gradient(135deg,#F3E5C0,#D4AF37,#A88438); color:#080506; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; font-size:0.76rem; border:none; border-radius:4px; cursor:pointer; }
      .vc-submit:disabled { opacity:0.6; cursor:wait; }
      /* Invoice Styling */
      .inv-box { padding:1.75rem; background:#fff; color:#111; font-size:0.84rem; }
      .inv-top { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #540A18; padding-bottom:1rem; margin-bottom:1rem; }
      .inv-brand { font-family:'Cinzel',serif; font-size:1.5rem; font-weight:700; color:#540A18; letter-spacing:0.16em; }
      .inv-table { width:100%; border-collapse:collapse; margin-block:1rem; }
      .inv-table th { background:#140508; color:#F3E5C0; text-align:left; padding:0.55rem 0.65rem; font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; }
      .inv-table td { padding:0.6rem 0.65rem; border-bottom:1px solid #e5e0d8; }
      .inv-actions { display:flex; gap:0.75rem; padding:1rem 1.6rem 1.5rem; background:#F8F5EE; border-top:1px solid #e5e0d8; }
      @media (max-width:640px) { .vc-grid-2, .vc-pay-grid { grid-template-columns:1fr; } }
      @media print {
        body * { visibility:hidden !important; }
        #veloraInvoiceModal, #veloraInvoiceModal * { visibility:visible !important; }
        #veloraInvoiceModal { position:fixed; inset:0; background:#fff !important; padding:0 !important; }
        .inv-actions, .vc-close { display:none !important; }
      }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="vc-overlay" id="veloraCheckoutModal" role="dialog" aria-modal="true">
        <div class="vc-card">
          <div class="vc-head">
            <h3>VELORA &mdash; SECURE ONLINE CHECKOUT</h3>
            <button type="button" class="vc-close" id="vcCloseBtn">&times;</button>
          </div>
          <form class="vc-body" id="veloraCheckoutForm">
            <div class="vc-grid-2">
              <div class="vc-field"><label>Full Name *</label><input type="text" id="vcName" required placeholder="e.g. Aarav Sharma" /></div>
              <div class="vc-field"><label>Mobile / WhatsApp *</label><input type="tel" id="vcPhone" required pattern="[0-9+\s-]{10,15}" placeholder="+91 98765 43210" /></div>
            </div>
            <div class="vc-grid-2">
              <div class="vc-field"><label>Email (For Digital Invoice) *</label><input type="email" id="vcEmail" required placeholder="you@example.com" /></div>
              <div class="vc-field"><label>Company &amp; GSTIN (Optional - B2B)</label><input type="text" id="vcGstin" placeholder="e.g. Studio Luxe / 29ABCDE1234F1Z5" /></div>
            </div>
            <div class="vc-field"><label>Complete Delivery Address *</label><textarea id="vcAddress" rows="2" required placeholder="House/Flat No., Building, Street, Landmark"></textarea></div>
            <div class="vc-grid-2">
              <div class="vc-field"><label>City &amp; State *</label><input type="text" id="vcCityState" required placeholder="e.g. Mumbai, Maharashtra" /></div>
              <div class="vc-field"><label>6-Digit Pincode *</label><input type="text" id="vcPincode" required pattern="[0-9]{6}" maxlength="6" placeholder="400001" /></div>
            </div>
            <div class="vc-field">
              <label>Select Payment Mode</label>
              <div class="vc-pay-grid" id="vcPayGrid">
                <div class="vc-pay-opt is-selected" data-pay="Cash on Delivery (COD)"><strong>Cash on Delivery</strong><span>Pay at Doorstep (Insured)</span></div>
                <div class="vc-pay-opt" data-pay="UPI / Direct Bank Transfer"><strong>UPI / Instant Transfer</strong><span>Concierge QR / Link</span></div>
                <div class="vc-pay-opt" data-pay="Online Card / Netbanking"><strong>Cards / Netbanking</strong><span>${RAZORPAY_KEY_ID ? 'Instant Gateway' : 'Concierge Link'}</span></div>
              </div>
            </div>
            <div class="vc-summary" id="vcOrderSummary"></div>
            <button type="submit" class="vc-submit" id="vcPlaceOrderBtn">Confirm Order &amp; Generate Tax Invoice &rarr;</button>
          </form>
        </div>
      </div>

      <div class="vc-overlay" id="veloraInvoiceModal" role="dialog" aria-modal="true">
        <div class="vc-card">
          <div class="vc-head">
            <h3>TAX INVOICE &amp; ORDER CONFIRMATION</h3>
            <button type="button" class="vc-close" id="invCloseBtn">&times;</button>
          </div>
          <div class="inv-box" id="veloraInvoiceContent"></div>
          <div class="inv-actions">
            <button type="button" class="vc-submit" style="flex:1;" onclick="window.print()">Download / Print PDF Invoice</button>
            <button type="button" class="vc-submit" id="invWhatsappBtn" style="flex:1;background:#140508;color:#F3E5C0;border:1px solid #D4AF37;">Send Order Slip on WhatsApp</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    let selectedPay = 'Cash on Delivery (COD)';
    document.getElementById('vcPayGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.vc-pay-opt');
      if (!card) return;
      document.querySelectorAll('.vc-pay-opt').forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      selectedPay = card.dataset.pay;
    });

    document.getElementById('vcCloseBtn').onclick = () => document.getElementById('veloraCheckoutModal').classList.remove('is-open');
    document.getElementById('invCloseBtn').onclick = () => {
const __invEl = document.getElementById('veloraInvoiceModal');
      if (__invEl) {
        __invEl.classList.remove('is-open');
        __invEl.style.display = 'none';
      }
    };

    document.getElementById('veloraCheckoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const state = getCartState();
      if (!state.items.length) return;
      const btn = document.getElementById('vcPlaceOrderBtn');
      btn.disabled = true;
      btn.textContent = 'Generating Invoice & Recording Order...';

      const orderId = 'VEL-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
      const orderDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const customer = {
        name: document.getElementById('vcName').value.trim(),
        phone: document.getElementById('vcPhone').value.trim(),
        email: document.getElementById('vcEmail').value.trim(),
        gstin: document.getElementById('vcGstin').value.trim() || 'Unregistered (B2C)',
        address: document.getElementById('vcAddress').value.trim(),
        cityState: document.getElementById('vcCityState').value.trim(),
        pincode: document.getElementById('vcPincode').value.trim(),
        paymentMode: selectedPay
      };

      const payload = {
        action: 'createOrder',
        orderId,
        orderDate,
        customer,
        items: state.items,
        subtotal: state.subtotal,
        discount: state.discount,
        taxableValue: state.taxableValue,
        totalGst: state.totalGst,
        grandTotal: state.grandTotal,
        status: selectedPay.includes('COD') ? 'Confirmed (COD)' : 'Confirmed (Awaiting Payment Link)'
      };

      try {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      // Save local order archive & clear cart
      try {
        if (window.VeloraBilling) { window.VeloraBilling.completeOrderAndResetCart(payload); } else { localStorage.setItem('velora_cart', '[]'); }
      } catch (e) {}

      btn.disabled = false;
      btn.textContent = 'Confirm Order & Generate Tax Invoice →';
      document.getElementById('veloraCheckoutModal').classList.remove('is-open');
      renderInvoice(payload); const invModal = document.getElementById('veloraInvoiceModal'); if (invModal) invModal.classList.add('is-open'); if (window.VeloraBilling && window.VeloraBilling.__autoModal && typeof window.VeloraBilling.openInvoiceModal === 'function') { window.VeloraBilling.openInvoiceModal(payload); }
    });
  }

  function renderInvoice(order) {
    const cgst = +(order.totalGst / 2).toFixed(2);
    const sgst = +(order.totalGst - cgst).toFixed(2);
    const rowsHtml = order.items.map((it, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(it.name)}</strong><br/><span style="font-size:0.74rem;color:#555;">Finish: ${escapeHtml(it.finish)} &bull; HSN: 9403</span></td>
        <td>${it.qty}</td>
        <td>${fmt(it.price)}</td>
        <td style="text-align:right;"><strong>${fmt(it.price * it.qty)}</strong></td>
      </tr>
    `).join('');

    document.getElementById('veloraInvoiceContent').innerHTML = `
      <div class="inv-top">
        <div>
          <div class="inv-brand">VELORA</div>
          <div style="font-size:0.74rem;color:#555;margin-top:2px;">Elevate Your Lifestyle &bull; Architectural Home Furniture<br/>Support: +91 82840 29319 &bull; velevanteyourlifestyle@gmail.com</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;color:#540A18;letter-spacing:0.08em;">RETAIL / TAX INVOICE</div>
          <div>Invoice No: <strong>${escapeHtml(order.orderId)}</strong></div>
          <div>Date: ${order.orderDate}</div>
          <div>Status: <span style="color:#15803d;font-weight:600;">${escapeHtml(order.status)}</span></div>
        </div>
      </div>
      <div class="vc-grid-2" style="margin-bottom:0.75rem;background:#FAF7F2;padding:0.85rem;border-radius:4px;">
        <div>
          <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.08em;color:#540A18;font-weight:700;">Billed &amp; Shipped To</div>
          <strong>${escapeHtml(order.customer.name)}</strong><br/>
          ${escapeHtml(order.customer.address)}, ${escapeHtml(order.customer.cityState)} - ${escapeHtml(order.customer.pincode)}<br/>
          Phone: ${escapeHtml(order.customer.phone)} &bull; Email: ${escapeHtml(order.customer.email)}<br/>
          GSTIN: ${order.customer.gstin}
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.08em;color:#540A18;font-weight:700;">Payment &amp; Dispatch</div>
          Mode: <strong>${order.customer.paymentMode}</strong><br/>
          Logistics: Insured Pan-India Doorstep<br/>
          Shipping Charges: <strong>Complimentary (₹0)</strong>
        </div>
      </div>
      <table class="inv-table">
        <thead><tr><th>#</th><th>Item &amp; HSN</th><th>Qty</th><th>Rate (Incl. GST)</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div style="max-width:320px;margin-left:auto;display:grid;gap:0.3rem;font-size:0.82rem;">
        <div class="vc-row"><span>Subtotal:</span><span>${fmt(order.subtotal)}</span></div>
        ${order.discount > 0 ? `<div class="vc-row" style="color:#15803d;"><span>Privilege Discount (10%):</span><span>-${fmt(order.discount)}</span></div>` : ''}
        <div class="vc-row"><span>Taxable Value:</span><span>${fmt(order.taxableValue)}</span></div>
        <div class="vc-row"><span>CGST (9%):</span><span>${fmt(cgst)}</span></div>
        <div class="vc-row"><span>SGST (9%):</span><span>${fmt(sgst)}</span></div>
        <div class="vc-row grand"><span>Grand Total (INR):</span><span>${fmt(order.grandTotal)}</span></div>
      </div>
      <div style="margin-top:1.25rem;padding-top:0.75rem;border-top:1px dashed #ccc;display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;color:#555;">
        <span>Computer-generated VELORA Luxury Invoice. Valid for warranty &amp; transit insurance.</span>
        <strong style="color:#540A18;">Authorized Signatory &mdash; VELORA India</strong>
      </div>
    `;

    document.getElementById('invWhatsappBtn').onclick = () => {
const itemLines = order.items.map((it, i) => `${i + 1}. ${escapeHtml(it.name)} (${escapeHtml(it.finish)}) x${it.qty} - ${fmt(it.price * it.qty)}`).join('\n');
      const waMsg = `*VELORA — Confirmed Order & Invoice (${escapeHtml(order.orderId)})*\n\n${itemLines}\n\n*Grand Total:* ${fmt(order.grandTotal)} (Incl. GST)\n*Payment Mode:* ${order.customer.paymentMode}\n*Customer:* ${escapeHtml(order.customer.name)} (${escapeHtml(order.customer.phone)})\n*Address:* ${escapeHtml(order.customer.address)}, ${escapeHtml(order.customer.cityState)} - ${escapeHtml(order.customer.pincode)}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank', 'noopener,noreferrer');
    };

    const __invEl = document.getElementById('veloraInvoiceModal');
    if (__invEl) {
      __invEl.classList.add('is-open');
      __invEl.style.display = 'flex';
      __invEl.style.zIndex = '10050';
      __invEl.scrollTop = 0;
    }
    setTimeout(() => {
window.dispatchEvent(new Event('storage')); }, 200);
  }

  function openCheckout() {
    injectUI();
    const state = getCartState();
    if (!state.items.length) {
      const t = document.getElementById('veloraToast');
      if (t) { t.textContent = 'Please add at least one piece to your bag first.'; t.classList.add('is-visible'); setTimeout(() => t.classList.remove('is-visible'), 3000); }
      return;
    }
    const cgst = +(state.totalGst / 2).toFixed(2);
    document.getElementById('vcOrderSummary').innerHTML = `
      <div class="vc-row"><span>Items (${state.items.reduce((s, i) => s + i.qty, 0)}):</span><span>${fmt(state.subtotal)}</span></div>
      ${state.discount > 0 ? `<div class="vc-row" style="color:#15803d;"><span>Code VELORA10 (10% OFF):</span><span>-${fmt(state.discount)}</span></div>` : ''}
      <div class="vc-row" style="font-size:0.76rem;color:#5C534E;"><span>Taxable Value (${fmt(state.taxableValue)}) + 18% GST (${fmt(cgst)} CGST + ${fmt(cgst)} SGST):</span><span>Included</span></div>
      <div class="vc-row"><span>Insured Pan-India Delivery:</span><span style="color:#15803d;font-weight:600;">FREE</span></div>
      <div class="vc-row grand"><span>Total Payable:</span><span>${fmt(state.grandTotal)}</span></div>
    `;
    document.getElementById('cartDrawer')?.classList.remove('is-open');
    document.getElementById('drawerBackdrop')?.classList.remove('is-open');
    document.getElementById('veloraCheckoutModal').classList.add('is-open');
  }

  document.addEventListener('DOMContentLoaded', () => {
const expBtn = document.getElementById('expressCheckoutBtn');
    if (expBtn) {
      const clone = expBtn.cloneNode(true);
      clone.innerHTML = '<span class="btn-text">Proceed to Online Checkout &amp; Invoice &rarr;</span>';
      expBtn.parentNode.replaceChild(clone, expBtn);
      clone.addEventListener('click', openCheckout);
    }
  });
})();










