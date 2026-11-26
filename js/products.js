/* ==========================================================================
   VELORA — LIVE GOOGLE SHEET PRODUCT CATALOG ENGINE (js/products.js)
   ========================================================================== */
window.VELORA_PRODUCTS = [];
window.VELORA_CATALOG_STATE = {
  status: 'loading', // 'loading' | 'ready' | 'error'
  error: ''
};

(function () {
  'use strict';

  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1yskAN_jSn2RRHHkt64wO0h4y855tGC2TdPm4NpKJFmM/gviz/tq?tqx=out:csv&sheet=Sheet1';

  const SLUG_MAP = {
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

  function normalizeCategory(raw) {
    const key = String(raw || 'clothes-rack').trim().toLowerCase();
    return SLUG_MAP[key] || key;
  }

  function parseCsvLine(line) {
    const out = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (ch === ',' && !inQ) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  }

  function fixDriveUrl(url, fallback) {
    const clean = String(url || '').trim();
    if (!clean) return fallback;
    return clean.replace(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/.*/, 'https://lh3.googleusercontent.com/d/$1');
  }

  function makeFallbackSku(name, index) {
    const slug = String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24);
    return slug ? 'vel-' + slug : 'vel-' + String(index + 1).padStart(2, '0');
  }

  async function loadCatalog() {
    window.VELORA_CATALOG_STATE.status = 'loading';
    window.VELORA_CATALOG_STATE.error = '';
    window.dispatchEvent(new Event('velora:catalogLoading'));

    try {
      localStorage.removeItem('velora_custom_products_v1');
    } catch (e) {}

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(SHEET_CSV_URL + '&cb=' + Date.now(), {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error('Catalog HTTP ' + res.status);

      const csv = await res.text();
      const lines = csv.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) throw new Error('Catalog sheet is empty');

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const seenIds = new Set();

      const items = lines
        .slice(1)
        .map((line, i) => {
          const cols = parseCsvLine(line);
          const row = {};
          headers.forEach((h, idx) => {
            row[h] = cols[idx] || '';
          });

          if (!row.name || !row.price) return null;
          const st = (row.status || 'active').trim().toLowerCase();
          if (st === 'hide' || st === 'draft') return null;

          const rawPriceStr = String(row.price || '').replace(/[^0-9]/g, '');
          if (!rawPriceStr) return null;
          const price = Number(rawPriceStr);

          const rawMrp = Number(String(row.mrp || '').replace(/[^0-9]/g, ''));
          const mrp = rawMrp > price ? rawMrp : null;

          const hasStock = row.stock !== undefined && row.stock !== '';
          const stock = hasStock ? Number(String(row.stock).replace(/[^0-9]/g, '')) : 12;

          let badge = row.badge || 'Best Seller';
          let badgeType = 'Silver';
          if (stock === 0) {
            badge = 'Sold Out';
            badgeType = 'maroon';
          } else if (stock <= 4) {
            badge = 'Only ' + stock + ' Left';
            badgeType = 'maroon';
          }

          // Prefer explicit id/sku column from Sheet; fall back deterministically if not yet added
          const explicitId = String(row.id || row.sku || '').trim();
          let id = explicitId || makeFallbackSku(row.name, i);
          if (seenIds.has(id)) id = id + '-' + (i + 1);
          seenIds.add(id);

          const img1 = fixDriveUrl(row.image, 'assets/images/product-1.jpg');
          const img2 = fixDriveUrl(row.hoverimage || row.image, img1);

          return {
            id,
            name: row.name,
            category: normalizeCategory(row.category),
            room: row.room || 'Bedroom',
            price,
            mrp,
            originalPrice: mrp,
            stock,
            badge,
            badgeType,
            image: img1,
            hoverImage: img2,
            finishes: row.finishes
              ? row.finishes.split('|').map((s) => s.trim()).filter(Boolean)
              : ['Brushed Silver', 'Brushed Gold', 'Matte Black'],
            dimensions: row.dimensions || '165cm H x 140cm W x 42cm D',
            material: row.material || '304-Grade Stainless Steel & Kiln-Dried Solid Wood',
            delivery: row.delivery || 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
            description: row.description || 'Handcrafted 304-grade stainless steel and seasoned solid wood architectural piece.'
          };
        })
        .filter(Boolean);

      if (!items.length) throw new Error('No active products found in sheet');

      window.VELORA_PRODUCTS.splice(0, window.VELORA_PRODUCTS.length, ...items);
      window.VELORA_CATALOG_STATE.status = 'ready';
      window.VELORA_CATALOG_STATE.error = '';
      window.dispatchEvent(new Event('velora:catalogUpdated'));
    } catch (err) {
      clearTimeout(timer);
      window.VELORA_CATALOG_STATE.status = 'error';
      window.VELORA_CATALOG_STATE.error = (err && err.message) || 'Unable to load product catalog';
      window.dispatchEvent(new Event('velora:catalogError'));
    }
  }

  window.reloadVeloraCatalog = loadCatalog;
  loadCatalog();
})();

/* Live Hero Showcase & Spotlight Sync from Google Sheet */
window.addEventListener('velora:catalogUpdated', () => {
  if (!Array.isArray(window.VELORA_PRODUCTS) || !window.VELORA_PRODUCTS.length) return;
  const byId = (id) => window.VELORA_PRODUCTS.find((p) => p.id === id);
  const slideMap = [
    { idx: 0, prod: byId('vel-06') || window.VELORA_PRODUCTS[5] || window.VELORA_PRODUCTS[0] },
    { idx: 1, prod: byId('vel-01') || window.VELORA_PRODUCTS[0] },
    { idx: 2, prod: byId('vel-04') || window.VELORA_PRODUCTS[3] || window.VELORA_PRODUCTS[0] }
  ];
  slideMap.forEach(({ idx, prod }) => {
    const slide = document.querySelector('.hero-slide[data-slide="' + idx + '"]');
    if (!slide || !prod) return;
    const titleEl = slide.querySelector('strong');
    const priceEl = slide.querySelector('.tag-price');
    const imgEl = slide.querySelector('img');
    if (titleEl) titleEl.textContent = prod.name;
    if (priceEl) priceEl.textContent = '₹' + Number(prod.price).toLocaleString('en-IN');
    if (imgEl && prod.image) imgEl.src = prod.image;
  });

  const spotProd = byId('vel-06') || window.VELORA_PRODUCTS[5] || window.VELORA_PRODUCTS[0];
  if (spotProd) {
    const spotTitle = document.querySelector('.spotlight-details .section-title');
    const spotPrice = document.querySelector('.spotlight-price');
    const spotBtn = document.querySelector('#spotlightAddBtn .btn-text');
    const fmt = '₹' + Number(spotProd.price).toLocaleString('en-IN');
    if (spotTitle) spotTitle.textContent = spotProd.name;
    if (spotPrice) spotPrice.textContent = fmt;
    if (spotBtn) spotBtn.textContent = 'Add to Bag — ' + fmt;
  }
});
