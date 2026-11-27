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

  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/19B_gbnR2kjsefn5-p47PRR4uWfLxhHxszJMVgTw_1dY/gviz/tq?tqx=out:csv&sheet=Sheet1';

  const SLUG_MAP = {
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


