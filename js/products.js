/* ==========================================================================
   VELORA — PRODUCT CATALOG & LIVE GOOGLE SHEET INVENTORY ENGINE
   ========================================================================== */
const VELORA_PRODUCTS = [
  {
    id: 'vel-01',
    name: 'Stepped 3-Tier Stainless Steel Clothes Rack',
    category: 'clothes-racks',
    room: 'Bedroom',
    price: 3299,
    mrp: 4499,
    originalPrice: 4499,
    stock: 14,
    badge: 'Best Seller',
    badgeType: 'Silver',
    image: 'assets/images/product-5.jpg',
    hoverImage: 'assets/images/product-1-hover.jpg',
    finishes: ['Mirror Chrome', 'Brushed Silver', 'Matte Black'],
    dimensions: '165cm H x 140cm W x 42cm D',
    material: '304-Grade Stainless Steel',
    delivery: 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
    description: 'Architectural 3-tier stepped garment stand crafted from heavy-gauge stainless steel with weighted circular base discs for effortless boutique organization.'
  },
  {
    id: 'vel-02',
    name: 'Leaning Angled Steel Garment Frame',
    category: 'storage-racks',
    room: 'Entryway',
    price: 2999,
    mrp: 3999,
    originalPrice: 3999,
    stock: 18,
    badge: 'New Release',
    badgeType: 'Silver',
    image: 'assets/images/product-2.jpg',
    hoverImage: 'assets/images/product-1-hover.jpg',
    finishes: ['Satin Steel', 'Brushed Silver'],
    dimensions: '170cm H x 105cm W x 45cm D',
    material: 'Powder-Coated & Satin Brushed Steel',
    delivery: 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
    description: 'Minimalist wall-leaning architectural garment frame engineered for modern Indian apartments and clutter-free entryways.'
  },
  {
    id: 'vel-03',
    name: 'Circular Hoop Garment Stand',
    category: 'clothes-racks',
    room: 'Dressing Area',
    price: 3799,
    mrp: 4999,
    originalPrice: 4999,
    stock: 9,
    badge: 'Studio Pick',
    badgeType: 'Silver',
    image: 'assets/images/product-4.jpg',
    hoverImage: 'assets/images/product-2.jpg',
    finishes: ['Matte Black', 'Antique Brass'],
    dimensions: '180cm H x 150cm W x 50cm D',
    material: 'Heavy-Gauge Tubular Steel & Solid Base',
    delivery: 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
    description: 'Sculptural full-arch hoop garment display built on a solid weighted base—ideal for luxury dressing rooms and curated retail studios.'
  },
  {
    id: 'vel-04',
    name: 'Round 4-Shelf Metal Wall Organizer',
    category: 'wall-shelves',
    room: 'Living Room',
    price: 2299,
    mrp: 3199,
    originalPrice: 3199,
    stock: 22,
    badge: 'Popular',
    badgeType: 'Silver',
    image: 'assets/images/product-3.jpg',
    hoverImage: 'assets/images/decor-lamp.jpg',
    finishes: ['Matte Black', 'Brushed Silver'],
    dimensions: '85cm Diameter x 18cm Depth',
    material: 'Matte Powder-Coated Steel Frame',
    delivery: 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
    description: 'Geometric circular floating wall shelf with four asymmetrical display tiers for books, ceramics, candles, and indoor greens.'
  },
  {
    id: 'vel-05',
    name: 'Curved Brushed Steel & Velvet Stool',
    category: 'stools',
    room: 'Living Room',
    price: 3499,
    mrp: 4699,
    originalPrice: 4699,
    stock: 7,
    badge: 'Limited Batch',
    badgeType: 'Silver',
    image: 'assets/images/product-1.jpg',
    hoverImage: 'assets/images/spotlight-tstand.jpg',
    finishes: ['Olive Velvet / Steel', 'Maroon Velvet / Silver'],
    dimensions: '46cm H x 44cm W x 42cm D',
    material: 'Cantilever Brushed Steel & Plush Velvet Cushion',
    delivery: 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
    description: 'Cantilever ribbon-bent brushed stainless steel accent stool topped with a tailored high-density velvet seat cushion.'
  },
  {
    id: 'vel-06',
    name: 'Solid Wood Cylinder Base T-Stand',
    category: 'clothes-racks',
    room: 'Bedroom',
    price: 3999,
    mrp: 5299,
    originalPrice: 5299,
    stock: 11,
    badge: 'Signature',
    badgeType: 'Silver',
    image: 'assets/images/spotlight-tstand.jpg',
    hoverImage: 'assets/images/product-5.jpg',
    finishes: ['Natural Teak Wood / Matte Black', 'Smoked Walnut Wood / Brushed Silver'],
    dimensions: '158cm H x 95cm W x 28cm D',
    material: '14kg Kiln-Dried Solid Wood Base & Steel Crossbar',
    delivery: 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
    description: 'Anchored by a 14kg kiln-dried solid wood cylinder base with a 95cm steel hanging crossbar—supports up to 35kg with zero wall drilling.'
  },
  {
    id: 'vel-07',
    name: 'Warm Beam Wall Spotlight Sconce',
    category: 'decor',
    room: 'Entryway',
    price: 1999,
    mrp: 2799,
    originalPrice: 2799,
    stock: 19,
    badge: 'Ready to Ship',
    badgeType: 'Silver',
    image: 'assets/images/decor-lamp.jpg',
    hoverImage: 'assets/images/product-3.jpg',
    finishes: ['Warm 2700K Bronze', 'Matte Black'],
    dimensions: '38cm H x 24cm Projection',
    material: 'Anodized Architectural Aluminum & Warm 2700K LED',
    delivery: 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
    description: 'Architectural halo wall sconce casting a warm 2700K ambient corona across textured walls, corridors, and bedside spaces.'
  },
  {
    id: 'vel-08',
    name: 'Two-Tier Entryway Shoe & Coat Stand',
    category: 'shoe-racks',
    room: 'Entryway',
    price: 2499,
    mrp: 3499,
    originalPrice: 3499,
    stock: 16,
    badge: 'Best Value',
    badgeType: 'Silver',
    image: 'assets/images/product-1-hover.jpg',
    hoverImage: 'assets/images/product-5.jpg',
    finishes: ['Brushed Silver', 'Mirror Chrome'],
    dimensions: '90cm H x 110cm W x 35cm D',
    material: '304-Grade Brushed Stainless Steel',
    delivery: 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
    description: 'Compact dual-level entryway organizer combining a ventilated footwear rack with an upper coat and bag rail.'
  }
];

(function initVeloraLiveCatalog() {
  try {
    const adminDraft = JSON.parse(localStorage.getItem('velora_custom_products_v1') || 'null'); if (Array.isArray(adminDraft) && adminDraft.length > 0) { VELORA_PRODUCTS.splice(0, VELORA_PRODUCTS.length, ...adminDraft); window.dispatchEvent(new Event('velora:catalogUpdated')); return; }
    const url = 'https://docs.google.com/spreadsheets/d/1yskAN_jSn2RRHHkt64wO0h4y855tGC2TdPm4NpKJFmM/gviz/tq?tqx=out:csv&sheet=Sheet1&cb=' + Date.now();
    fetch(url, { cache: 'no-store' })
      .then((r) => r.text())
      .then((csv) => {
        const lines = csv.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) return;
        const parseLine = (line) => {
          const out = [];
          let cur = '';
          let inQ = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') inQ = !inQ;
            else if (ch === ',' && !inQ) { out.push(cur.trim()); cur = ''; }
            else cur += ch;
          }
          out.push(cur.trim());
          return out;
        };
        const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const items = lines.slice(1).map((line, i) => {
          const cols = parseLine(line);
          const row = {};
          headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });
          if (!row.name || !row.price) return null;
          const st = (row.status || 'active').trim().toLowerCase();
          if (st === 'hide' || st === 'draft') return null;

          const price = Number(String(row.price).replace(/[^0-9]/g, '')) || 3499;
          const rawMrp = Number(String(row.mrp || '').replace(/[^0-9]/g, ''));
          const mrp = rawMrp > price ? rawMrp : null;
          const hasStock = row.stock !== undefined && row.stock !== '';
          const stock = hasStock ? Number(String(row.stock).replace(/[^0-9]/g, '')) : 12;

          let badge = row.badge || 'Best Seller';
          let badgeType = 'Silver';
          if (stock === 0) { badge = 'Sold Out'; badgeType = 'maroon'; }
          else if (stock <= 4) { badge = 'Only ' + stock + ' Left'; badgeType = 'maroon'; }

          const fixDrive = (u, fb) => (u || fb).replace(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/.*/, 'https://lh3.googleusercontent.com/d/$1');
          const img1 = fixDrive(row.image, 'assets/images/product-1.jpg');
          const img2 = fixDrive(row.hoverimage || row.image, img1);

          return {
            id: 'vel-0' + (i + 1),
            name: row.name,
            category: (row.category || 'clothes-racks').toLowerCase(),
            room: row.room || 'Bedroom',
            price,
            mrp,
            originalPrice: mrp,
            stock,
            badge,
            badgeType,
            image: img1,
            hoverImage: img2,
            finishes: row.finishes ? row.finishes.split('|').map((s) => s.trim()).filter(Boolean) : ['Brushed Silver', 'Brushed Gold', 'Matte Black'],
            dimensions: row.dimensions || '165cm H x 140cm W x 42cm D',
            material: row.material || '304-Grade Stainless Steel & Kiln-Dried Solid Wood',
            delivery: row.delivery || 'Dispatches in 24–48 Hrs • Free Insured Pan-India Delivery',
            description: row.description || 'Handcrafted 304-grade stainless steel and seasoned solid wood architectural piece.'
          };
        }).filter(Boolean);

        if (items.length > 0) {
          VELORA_PRODUCTS.splice(0, VELORA_PRODUCTS.length, ...items);
          window.dispatchEvent(new Event('velora:catalogUpdated'));
        }
      })
      .catch(() => {});
  } catch (e) {}
})();

