/* ==========================================================================
   VELORA — ONLINE CHECKOUT, SERVER-VERIFIED ORDER SYNC & CONFIRMATION ENGINE
   ========================================================================== */
(function () {
  'use strict';

  const Store = window.VeloraStore;
  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const escapeHtml = Store.escapeHtml;

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbycPTz5PqooEFkcZo2CRcJgXFgqJOYdrZem705OTFHGxa9yeCYBYZutDEDjZF6vcz0k/exec';
  const WHATSAPP_NUMBER = '918284029319';
  const RAZORPAY_KEY_ID = '';

  function lockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function buildWhatsAppOrderUrl(customer, items, totals, orderId) {
    const itemLines = items
      .map((it, i) => `${i + 1}. ${it.name} (${it.finish}) x${it.qty} - ${fmt(it.price * it.qty)}`)
      .join('\n');
    const discLine = totals.discount > 0 ? `\n*Discount (${totals.promoCode || 'VELORA10'}):* -${fmt(totals.discount)}` : '';
    const header = orderId ? `*VELORA — Confirmed Order (${orderId})*` : '*VELORA — Order Request (Direct Concierge)*';
    const waMsg = `${header}\n\n${itemLines}${discLine}\n\n*Grand Total:* ${fmt(totals.grandTotal)} (Incl. GST)\n*Payment Mode:* ${customer.paymentMode}\n*Customer:* ${customer.name} (${customer.phone})\n*Address:* ${customer.address}, ${customer.cityState} - ${customer.pincode}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
  }

  function injectUI() {
    if (document.getElementById('veloraCheckoutModal')) return;
    const style = document.createElement('style');
    style.textContent = `
      .vc-overlay { position:fixed; inset:0; z-index:10050; background:rgba(8,5,6,0.82); backdrop-filter:blur(14px); display:none; align-items:center; justify-content:center; padding:1rem; overflow-y:auto; overscroll-behavior:contain; }
      .vc-overlay.is-open { display:flex; }
      .vc-card { width:100%; max-width:740px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; background:#FFFDF9; color:#120C0E; border:1px solid rgba(212,175,55,0.55); border-radius:8px; box-shadow:0 32px 90px rgba(0,0,0,0.75); }
      .vc-head { background:linear-gradient(135deg,#140508,#3D0712); color:#F8F5EE; padding:1.1rem 1.5rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(212,175,55,0.35); flex-shrink:0; }
      .vc-head h3 { font-family:'Cinzel',serif; letter-spacing:0.14em; font-size:1.02rem; color:#F3E5C0; margin:0; }
      .vc-close { background:none; border:none; color:#F3E5C0; font-size:1.6rem; cursor:pointer; line-height:1; }
      .vc-body { padding:1.2rem 1.5rem; display:grid; gap:0.9rem; overflow-y:auto; flex:1; }
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
      .vc-summary { background:#F8F5EE; border:1px solid rgba(212,175,55,0.35); border-radius:5px; padding:0.9rem 1.1rem; font-size:0.84rem; display:grid; gap:0.35rem; }
      .vc-row { display:flex; justify-content:space-between; }
      .vc-row.grand { border-top:1px solid rgba(18,12,14,0.12); padding-top:0.45rem; margin-top:0.25rem; font-weight:700; font-size:0.98rem; color:#540A18; }
      .vc-error-box { display:none; background:#FEF2F2; border:1px solid #DC2626; color:#7F1D1D; padding:0.85rem 1rem; border-radius:5px; font-size:0.82rem; line-height:1.45; }
      .vc-error-box.is-visible { display:block; }
      .vc-submit { width:100%; padding:0.88rem; background:linear-gradient(135deg,#F3E5C0,#D4AF37,#A88438); color:#080506; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; font-size:0.75rem; border:none; border-radius:4px; cursor:pointer; }
      .vc-submit:disabled { opacity:0.6; cursor:wait; }
      .inv-box { padding:0.85rem 1.25rem; background:#fff; color:#111; font-size:0.79rem; line-height:1.38; overflow-y:auto; flex:1; }
      .inv-top { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #540A18; padding-bottom:0.55rem; margin-bottom:0.65rem; }
      .inv-brand { font-family:'Cinzel',serif; font-size:1.45rem; font-weight:700; color:#540A18; letter-spacing:0.16em; }
      .inv-table { width:100%; border-collapse:collapse; margin-block:0.55rem; }
      .inv-table th { background:#140508; color:#F3E5C0; text-align:left; padding:0.38rem 0.5rem; font-size:0.66rem; letter-spacing:0.08em; text-transform:uppercase; }
      .inv-table td { padding:0.38rem 0.5rem; border-bottom:1px solid #e5e0d8; }
      .inv-actions { display:flex; gap:0.75rem; padding:0.75rem 1.25rem 0.95rem; background:#F8F5EE; border-top:1px solid #e5e0d8; flex-shrink:0; }
      @media (max-width:640px) { .vc-grid-2, .vc-pay-grid { grid-template-columns:1fr; } .inv-actions { flex-direction:column; } }
      @media print {
        @page { size: A4 portrait; margin: 10mm; }
        html, body { height: auto !important; overflow: visible !important; background: #fff !important; }
        body > *:not(:has(#veloraInvoiceModal)), #veloraCheckoutModal { display: none !important; }
        #veloraInvoiceModal, #veloraInvoiceModal * { visibility: visible !important; }
        #veloraInvoiceModal { display: block !important; position: static !important; inset: auto !important; width: 100% !important; max-width: 100% !important; height: auto !important; max-height: none !important; overflow: visible !important; padding: 0 !important; margin: 0 !important; background: #fff !important; backdrop-filter: none !important; }
        #veloraInvoiceModal .vc-card { display: block !important; width: 100% !important; max-width: 100% !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
        #veloraInvoiceModal .inv-box { display: block !important; overflow: visible !important; padding: 0.4rem 0.2rem !important; color: #111 !important; background: #fff !important; }
        #veloraInvoiceModal .inv-actions, #veloraInvoiceModal .vc-close { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="vc-overlay" id="veloraCheckoutModal" role="dialog" aria-modal="true">
        <div class="vc-card">
          <div class="vc-head">
            <h3>VELORA &mdash; ORDER &amp; DELIVERY DETAILS</h3>
            <button type="button" class="vc-close" id="vcCloseBtn" aria-label="Close checkout">&times;</button>
          </div>
          <form class="vc-body" id="veloraCheckoutForm">
            <div style="position:absolute;left:-9999px;" aria-hidden="true">
              <label for="vcWebsite">Leave blank</label>
              <input type="text" id="vcWebsite" tabindex="-1" autocomplete="off" />
            </div>
            <div class="vc-grid-2">
              <div class="vc-field"><label for="vcName">Full Name *</label><input type="text" id="vcName" required placeholder="e.g. Aarav Sharma" /></div>
              <div class="vc-field"><label for="vcPhone">Mobile / WhatsApp *</label><input type="tel" id="vcPhone" required pattern="[0-9+\\s-]{10,15}" placeholder="+91 98765 43210" /></div>
            </div>
            <div class="vc-grid-2">
              <div class="vc-field"><label for="vcEmail">Email (For Order Summary) *</label><input type="email" id="vcEmail" required placeholder="you@example.com" /></div>
              <div class="vc-field"><label for="vcGstin">Company &amp; GSTIN (Optional - B2B)</label><input type="text" id="vcGstin" placeholder="e.g. Studio Luxe / 29ABCDE1234F1Z5" /></div>
            </div>
            <div class="vc-field"><label for="vcAddress">Complete Delivery Address *</label><textarea id="vcAddress" rows="2" required placeholder="House/Flat No., Building, Street, Landmark"></textarea></div>
            <div class="vc-grid-2">
              <div class="vc-field"><label for="vcCityState">City &amp; State *</label><input type="text" id="vcCityState" required placeholder="e.g. Mumbai, Maharashtra" /></div>
              <div class="vc-field"><label for="vcPincode">6-Digit Pincode *</label><input type="text" id="vcPincode" required pattern="[0-9]{6}" maxlength="6" placeholder="400001" /></div>
            </div>
            <div class="vc-field">
              <label>Select Payment Mode</label>
              <div class="vc-pay-grid" id="vcPayGrid">
                <div class="vc-pay-opt is-selected" data-pay="Cash on Delivery (COD)"><strong>Cash on Delivery</strong><span>Pay at Doorstep (Insured)</span></div>
                <div class="vc-pay-opt" data-pay="UPI / Direct Bank Transfer"><strong>UPI / Instant Transfer</strong><span>Concierge QR / Link</span></div>
                <div class="vc-pay-opt" data-pay="Online Card / Netbanking"><strong>Cards / Netbanking</strong><span>${RAZORPAY_KEY_ID ? 'Instant Gateway' : 'Concierge Link'}</span></div>
              </div>
            </div>
                        <div id="veloraUpiBox" style="display:none;padding:1rem;border:1px solid rgba(212,175,55,0.6);border-radius:6px;background:#FAF7F2;font-size:0.82rem;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.7rem;">
                <strong style="font-family:'Cinzel',serif;font-size:0.86rem;color:#540A18;letter-spacing:0.08em;">INSTANT UPI PAYMENT (MOBILE APP / QR)</strong>
                <span style="font-size:0.68rem;padding:2px 8px;border-radius:99px;background:#EFE8DC;color:#540A18;font-weight:700;">Zero Fee &bull; Instant</span>
              </div>
              <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
                <div style="width:128px;background:#fff;padding:6px;border-radius:6px;border:1px solid rgba(0,0,0,0.12);text-align:center;flex-shrink:0;">
                  <img src="assets/images/velora-upi-qr.jpg" alt="VELORA UPI QR" style="width:100%;height:auto;border-radius:4px;display:block;" />
                  <div style="font-size:0.62rem;font-weight:600;margin-top:4px;color:#540A18;">Scan via Any UPI App</div>
                </div>
                <div style="flex:1;min-width:195px;line-height:1.5;color:#3E3537;">
                  <div style="font-weight:700;color:#120C0E;margin-bottom:4px;">Payee: RIYAN (VELORA Official)</div>
                  <div style="margin-bottom:0.55rem;">On mobile, tap below to open GPay, PhonePe, or Paytm directly with your exact payable amount:</div>
                  <a id="vcUpiAppBtn" href="upi://pay?pa=50100918358454@HDFC0003029.ifsc.npci&pn=RIYAN&cu=INR&tn=VELORA%20Order" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0.55rem 0.9rem;background:#140508;color:#F3E5C0;border:1px solid #D4AF37;border-radius:4px;text-decoration:none;font-weight:700;font-size:0.75rem;letter-spacing:0.06em;text-transform:uppercase;">
                    Open UPI App &amp; Pay Now &rarr;
                  </a>
                </div>
              </div>
              <div class="vc-field" style="margin-top:0.85rem;">
                <label for="vcUtr">12-Digit UPI Transaction UTR / Ref No. (Mandatory for Confirmation) *</label>
                <input type="text" id="vcUtr" inputmode="numeric" maxlength="12" pattern="[0-9]{12}" placeholder="Enter exact 12-digit UTR number from GPay / PhonePe / Paytm" />
                <span style="font-size:0.7rem;color:#6B5E62;">Order will only confirm after entering a valid 12-digit payment reference number.</span>
              </div>
            </div>
            <div class="vc-summary" id="vcOrderSummary"></div>
            <div class="vc-error-box" id="vcErrorBox" role="alert"></div>
            <button type="submit" class="vc-submit" id="vcPlaceOrderBtn">Confirm Order &amp; Generate Summary &rarr;</button>
          </form>
        </div>
      </div>

      <div class="vc-overlay" id="veloraInvoiceModal" role="dialog" aria-modal="true">
        <div class="vc-card">
          <div class="vc-head">
            <h3>ORDER CONFIRMATION &amp; SUMMARY</h3>
            <button type="button" class="vc-close" id="invCloseBtn" aria-label="Close confirmation">&times;</button>
          </div>
          <div class="inv-box" id="veloraInvoiceContent"></div>
          <div class="inv-actions">
            <button type="button" class="vc-submit" style="flex:1;" onclick="window.print()">Download / Print PDF Summary</button>
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
      const upiBox = document.getElementById('veloraUpiBox');
      const utrInp = document.getElementById('vcUtr');
      const isPrepaid = !selectedPay.toLowerCase().includes('cod');
      if (upiBox) upiBox.style.display = isPrepaid ? 'block' : 'none';
      if (utrInp) utrInp.required = isPrepaid;
    });

    function closeCheckoutModal() {
      document.getElementById('veloraCheckoutModal')?.classList.remove('is-open');
      unlockScroll();
    }

    function closeInvoiceModal() {
      document.getElementById('veloraInvoiceModal')?.classList.remove('is-open');
      unlockScroll();
    }

    document.getElementById('vcCloseBtn').onclick = closeCheckoutModal;
    document.getElementById('invCloseBtn').onclick = closeInvoiceModal;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.getElementById('veloraCheckoutModal')?.classList.contains('is-open')) closeCheckoutModal();
        if (document.getElementById('veloraInvoiceModal')?.classList.contains('is-open')) closeInvoiceModal();
      }
    });

    document.getElementById('veloraCheckoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const totals = Store.calculateTotals();
      if (!totals.items.length) return;

      const btn = document.getElementById('vcPlaceOrderBtn');
      const errBox = document.getElementById('vcErrorBox');
      errBox.classList.remove('is-visible');
      errBox.innerHTML = '';

      btn.disabled = true;
      btn.textContent = 'Verifying Prices & Recording Order...';

      const customer = {
        name: document.getElementById('vcName').value.trim(),
        phone: document.getElementById('vcPhone').value.trim(),
        email: document.getElementById('vcEmail').value.trim(),
        gstin: document.getElementById('vcGstin').value.trim() || 'Unregistered (B2C)',
        address: document.getElementById('vcAddress').value.trim(),
        cityState: document.getElementById('vcCityState').value.trim(),
        pincode: document.getElementById('vcPincode').value.trim(),
        paymentMode: selectedPay,
        utr: (document.getElementById('vcUtr')?.value || '').trim()
      };

      // Send only product IDs, finish, qty and promoCode — server computes authoritative prices
      const payload = {
        action: 'createOrder',
        website: document.getElementById('vcWebsite').value,
        customer,
        items: totals.items.map((it) => ({
          id: it.id,
          name: it.name,
          finish: it.finish,
          qty: it.qty
        })),
        promoCode: totals.promoCode
      };

      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Order server returned HTTP ' + res.status);
        const data = await res.json();
        if (!data || !data.ok) {
          throw new Error((data && data.error) || 'Could not confirm your order.');
        }

        if (window.VeloraBilling && typeof window.VeloraBilling.completeOrderAndResetCart === 'function') {
          window.VeloraBilling.completeOrderAndResetCart(data);
        } else {
          Store.clearCart();
        }

        btn.disabled = false;
        btn.textContent = 'Confirm Order & Generate Summary →';
        document.getElementById('veloraCheckoutModal').classList.remove('is-open');
        renderInvoice(data);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Confirm Order & Generate Summary →';
        const waFallback = buildWhatsAppOrderUrl(customer, totals.items, totals, '');
        errBox.innerHTML = `
          <strong>Could not record order automatically:</strong> ${escapeHtml((err && err.message) || 'Network error')}.<br/>
          Please check your connection and retry, or place this exact order instantly via WhatsApp:<br/>
          <a href="${waFallback}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:0.5rem;padding:0.45rem 0.85rem;background:#140508;color:#F3E5C0;border-radius:4px;text-decoration:none;font-weight:600;">Complete Order on WhatsApp &rarr;</a>
        `;
        errBox.classList.add('is-visible');
      }
    });
  }

  function renderInvoice(order) {
    const cgst = +(Number(order.totalGst || 0) / 2).toFixed(2);
    const sgst = +(Number(order.totalGst || 0) - cgst).toFixed(2);
    const rowsHtml = order.items.map((it, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(it.name)}</strong><br/><span style="font-size:0.74rem;color:#555;">Finish: ${escapeHtml(it.finish)}</span></td>
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
          <div style="font-weight:700;color:#540A18;letter-spacing:0.08em;">ORDER CONFIRMATION</div>
          <div>Order Ref: <strong>${escapeHtml(order.orderId)}</strong></div>
          <div>Date: ${escapeHtml(order.orderDate)}</div>
          <div>Status: <span style="color:#15803d;font-weight:600;">${escapeHtml(order.status)}</span></div>
        </div>
      </div>
      <div class="vc-grid-2" style="margin-bottom:0.75rem;background:#FAF7F2;padding:0.85rem;border-radius:4px;">
        <div>
          <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.08em;color:#540A18;font-weight:700;">Billed &amp; Shipped To</div>
          <strong>${escapeHtml(order.customer.name)}</strong><br/>
          ${escapeHtml(order.customer.address)}, ${escapeHtml(order.customer.cityState)} - ${escapeHtml(order.customer.pincode)}<br/>
          Phone: ${escapeHtml(order.customer.phone)} &bull; Email: ${escapeHtml(order.customer.email)}<br/>
          GSTIN: ${escapeHtml(order.customer.gstin)}
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.08em;color:#540A18;font-weight:700;">Payment &amp; Dispatch</div>
          Mode: <strong>${escapeHtml(order.customer.paymentMode)}</strong><br/>${order.customer.utr ? 'UPI Ref / UTR: <strong>' + escapeHtml(order.customer.utr) + '</strong><br/>' : ''}
          Logistics: Insured Pan-India Doorstep<br/>
          Shipping Charges: <strong>Complimentary (₹0)</strong>
        </div>
      </div>
      <table class="inv-table">
        <thead><tr><th>#</th><th>Item &amp; Finish</th><th>Qty</th><th>Rate (Incl. GST)</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div style="max-width:320px;margin-left:auto;display:grid;gap:0.3rem;font-size:0.82rem;">
        <div class="vc-row"><span>Subtotal:</span><span>${fmt(order.subtotal)}</span></div>
        ${order.discount > 0 ? `<div class="vc-row" style="color:#15803d;"><span>Privilege Discount (${escapeHtml(order.promoCode || 'VELORA10')}):</span><span>-${fmt(order.discount)}</span></div>` : ''}
        <div class="vc-row"><span>Taxable Value (Est.):</span><span>${fmt(order.taxableValue)}</span></div>
        <div class="vc-row"><span>CGST (9% Incl.):</span><span>${fmt(cgst)}</span></div>
        <div class="vc-row"><span>SGST (9% Incl.):</span><span>${fmt(sgst)}</span></div>
        <div class="vc-row grand"><span>Grand Total (INR):</span><span>${fmt(order.grandTotal)}</span></div>
      </div>
      <div style="margin-top:1rem;padding-top:0.65rem;border-top:1px dashed #ccc;display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;color:#555;">
        <span>Computer-generated VELORA Order Confirmation. Formal GST invoice issued upon dispatch.</span>
        <strong style="color:#540A18;">VELORA India Concierge</strong>
      </div>
    `;

    document.getElementById('invWhatsappBtn').onclick = () => {
      const url = buildWhatsAppOrderUrl(order.customer, order.items, order, order.orderId);
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    const invEl = document.getElementById('veloraInvoiceModal');
    if (invEl) {
      invEl.classList.add('is-open');
      lockScroll();
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
  }

  function openCheckout() {
    injectUI();
    const totals = Store.calculateTotals();
    if (!totals.items.length) {
      const t = document.getElementById('veloraToast');
      if (t) {
        t.textContent = 'Please add at least one piece to your bag first.';
        t.classList.add('is-visible');
        setTimeout(() => t.classList.remove('is-visible'), 3000);
      }
      return;
    }
    const errBox = document.getElementById('vcErrorBox');
    if (errBox) errBox.classList.remove('is-visible');

    document.getElementById('vcOrderSummary').innerHTML = `
      <div class="vc-row"><span>Items (${totals.totalQty}):</span><span>${fmt(totals.subtotal)}</span></div>
      ${totals.discount > 0 ? `<div class="vc-row" style="color:#15803d;"><span>Code ${escapeHtml(totals.promoCode)} (10% OFF):</span><span>-${fmt(totals.discount)}</span></div>` : ''}
      <div class="vc-row" style="font-size:0.76rem;color:#5C534E;"><span>Taxable Value (${fmt(totals.taxableValue)}) + 18% GST (${fmt(totals.cgst)} CGST + ${fmt(totals.sgst)} SGST):</span><span>Included</span></div>
      <div class="vc-row"><span>Insured Pan-India Delivery:</span><span style="color:#15803d;font-weight:600;">FREE</span></div>
      <div class="vc-row grand"><span>Total Payable:</span><span>${fmt(totals.grandTotal)}</span></div>
    `;
    document.getElementById('cartDrawer')?.classList.remove('is-open');
    document.getElementById('drawerBackdrop')?.classList.remove('is-visible');
    lockScroll();
    const upiLink = document.getElementById('vcUpiAppBtn');
    if (upiLink) {
      upiLink.href = 'upi://pay?pa=50100918358454@HDFC0003029.ifsc.npci&pn=RIYAN&am=' + Number(totals.grandTotal).toFixed(2) + '&cu=INR&tn=VELORA%20Order';
      upiLink.innerHTML = 'Pay ' + fmt(totals.grandTotal) + ' via UPI App &rarr;';
    }
    document.getElementById('veloraCheckoutModal').classList.add('is-open');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const expBtn = document.getElementById('expressCheckoutBtn');
    if (expBtn) {
      const clone = expBtn.cloneNode(true);
      clone.innerHTML = '<span class="btn-text">Proceed to Online Order &amp; Summary &rarr;</span>';
      expBtn.parentNode.replaceChild(clone, expBtn);
      clone.addEventListener('click', openCheckout);
    }
  });
})();

