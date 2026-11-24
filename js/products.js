const VELORA_SITE_CONFIG = {
  whatsappNumber: '919876543210',
  supportEmail: 'concierge@veloraliving.in',
  supportHours: 'Mon – Sat: 10:00 AM – 7:00 PM IST',
  dispatchWindow: 'Dispatched in 48 hrs • Delivery in 4–6 days across India',
  metrics: [
    { target: 4200, suffix: '+', label: 'Orders Delivered' },
    { target: 24, suffix: '', label: 'Core Designs' },
    { target: 140, suffix: '+', label: 'Cities Served' }
  ]
};

const VELORA_PRODUCTS = [
  {
    id: 'vel-01',
    name: 'Stepped 3-Tier Stainless Steel Clothes Rack',
    category: 'clothes-rack',
    room: 'Bedroom',
    price: 3499,
    mrp: null,
    badge: 'Best Seller',
    badgeType: 'Silver',
    image: 'assets/images/product-5.jpg',
    hoverImage: 'assets/images/product-1-hover.jpg',
    finishes: ['Mirror Chrome', 'Brushed Silver', 'Matte Black'],
    dimensions: '165cm H x 140cm W x 42cm D',
    description: 'Three-level stepped garment rack built from 25mm heavy-gauge 304-grade steel tubing with weighted 28cm disc bases. Supports up to 45kg without wall drilling.'
  },
  {
    id: 'vel-02',
    name: 'Leaning Angled Steel Garment Frame',
    category: 'storage-rack',
    room: 'Entryway',
    price: 3499,
    mrp: null,
    badge: 'New Release',
    badgeType: 'Silver',
    image: 'assets/images/product-2.jpg',
    hoverImage: 'assets/images/product-1-hover.jpg',
    finishes: ['Satin Steel', 'Brushed Silver'],
    dimensions: '170cm H x 105cm W x 45cm D',
    description: 'Slanted free-standing steel frame with rubber-padded floor rails for crease-free hanging of coats, sarees, and daily outfits.'
  },
  {
    id: 'vel-03',
    name: 'Circular Hoop Garment Stand',
    category: 'clothes-rack',
    room: 'Store',
    price: 3499,
    mrp: null,
    badge: 'Studio Pick',
    badgeType: 'maroon',
    image: 'assets/images/product-4.jpg',
    hoverImage: 'assets/images/product-2.jpg',
    finishes: ['Matte Black', 'Antique Brass'],
    dimensions: '180cm H x 150cm W x 50cm D',
    description: 'Full-circle powder-coated steel rack with 36 individual hanger notches and a solid weighted base plate for homes and retail stores.'
  },
  {
    id: 'vel-04',
    name: 'Round 4-Shelf Metal Wall Organizer',
    category: 'wall-shelf',
    room: 'Living',
    price: 3999,
    mrp: null,
    badge: 'Popular',
    badgeType: 'Silver',
    image: 'assets/images/product-3.jpg',
    hoverImage: 'assets/images/decor-lamp.jpg',
    finishes: ['Matte Black', 'Brushed Silver'],
    dimensions: '85cm Diameter x 18cm Depth',
    description: 'Wall-mounted circular steel shelf with four staggered display ledges for books, planters, and table lamps. Includes concealed wall anchors.'
  },
  {
    id: 'vel-05',
    name: 'Curved Brushed Steel & Velvet Stool',
    category: 'stool',
    room: 'Living',
    price: 3499,
    mrp: null,
    badge: 'Limited Batch',
    badgeType: 'maroon',
    image: 'assets/images/product-1.jpg',
    hoverImage: 'assets/images/spotlight-tstand.jpg',
    finishes: ['Olive Velvet / Steel', 'Maroon Velvet / Silver'],
    dimensions: '46cm H x 44cm W x 42cm D',
    description: 'Bent 6mm brushed stainless steel frame paired with a high-density foam seat upholstered in stain-resistant cotton velvet. Tested to 120kg.'
  },
  {
    id: 'vel-06',
    name: 'Solid Wood Cylinder Base T-Stand',
    category: 'clothes-rack',
    room: 'Bedroom',
    price: 3499,
    mrp: null,
    badge: 'Signature',
    badgeType: 'Silver',
    image: 'assets/images/spotlight-tstand.jpg',
    hoverImage: 'assets/images/product-5.jpg',
    finishes: ['Natural Teak Wood / Matte Black', 'Smoked Walnut Wood / Brushed Silver'],
    dimensions: '158cm H x 95cm W x 28cm D',
    description: '14kg solid natural Solid Wood cylinder base supporting a 95cm powder-coated steel crossbar with felt floor protection.'
  },
  {
    id: 'vel-07',
    name: 'Warm Beam Wall Spotlight Sconce',
    category: 'decor',
    room: 'Entryway',
    price: 3499,
    mrp: null,
    badge: 'Ready to Ship',
    badgeType: 'Silver',
    image: 'assets/images/decor-lamp.jpg',
    hoverImage: 'assets/images/product-3.jpg',
    finishes: ['Warm 2700K Bronze', 'Matte Black'],
    dimensions: '38cm H x 24cm Projection',
    description: 'Hardwired metal wall spotlight with an integrated 7W warm-white LED module designed to highlight entryways and wall shelving.'
  },
  {
    id: 'vel-08',
    name: 'Two-Tier Entryway Shoe & Coat Stand',
    category: 'shoe-rack',
    room: 'Entryway',
    price: 3499,
    mrp: null,
    badge: 'Best Value',
    badgeType: 'maroon',
    image: 'assets/images/product-1-hover.jpg',
    hoverImage: 'assets/images/product-5.jpg',
    finishes: ['Brushed Silver', 'Mirror Chrome'],
    dimensions: '90cm H x 110cm W x 35cm D',
    description: 'Compact open-frame steel stand holding up to 8 pairs of footwear on lower rails with upper hanging space for jackets and bags.'
  }
];

function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}







// ============================================================================
// LIVE GOOGLE SHEET CSV AUTO-SYNC ENGINE (NO-CODE PRODUCT UPDATES)
// ============================================================================
const VELORA_DEFAULT_SHEET_CSV = "https://docs.google.com/spreadsheets/d/1yskAN_jSn2RRHHkt64wO0h4y855tGC2TdPm4NpKJFmM/gviz/tq?tqx=out:csv&sheet=Sheet1"; // Paste published Google Sheet CSV URL here for global live sync

(function initVeloraLiveCatalog() {
  try {
    // 1. Check if admin studio saved local preview products
    const localSaved = localStorage.getItem('velora_custom_products_v1');
    if (localSaved && typeof VELORA_PRODUCTS !== 'undefined') {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        VELORA_PRODUCTS.length = 0;
        VELORA_PRODUCTS.push(...parsed);
      }
    }

    // 2. Fetch live rows from Google Sheet CSV if configured
    const sheetUrl = (typeof VELORA_GOOGLE_SHEET_CSV !== 'undefined' && VELORA_GOOGLE_SHEET_CSV) || localStorage.getItem('velora_google_sheet_csv') || VELORA_DEFAULT_SHEET_CSV;
    if (!sheetUrl || typeof VELORA_PRODUCTS === 'undefined') return;

    fetch(sheetUrl)
      .then(res => res.text())
      .then(csvText => {
        const lines = csvText.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const sheetItems = lines.slice(1).map((line, i) => {
          const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
          const row = {};
          headers.forEach((h, idx) => row[h] = cols[idx] || '');
          if (!row.name || !row.price) return null;
          const price = Number(row.price.replace(/[^0-9]/g, '')) || 4999;
          return {
            id: row.id || ('velora-sheet-' + (i + 1)),
            name: row.name,
            category: row.category || 'clothes-racks',
            room: row.room || 'Bedroom',
            price,
            originalPrice: Number((row.mrp || '').replace(/[^0-9]/g, '')) || Math.round(price * 1.25),
            badge: row.badge || 'NEW ARRIVAL',
            image: row.image || 'assets/images/product-1.jpg',
            hoverImage: row.hoverimage || row.image || 'assets/images/product-1.jpg',
            finishes: row.finishes ? row.finishes.split('|').map(s => s.trim()) : ['Teak & Brushed Silver', 'Walnut & Matte Obsidian'],
            dimensions: row.dimensions || '165 cm (H) x 110 cm (W) x 42 cm (D)',
            material: row.material || '304-Grade Brushed Steel & Kiln-Dried Solid Wood',
            weightCapacity: '85 kg',
            description: row.description || 'Hand-finished solid wood base paired with 304-grade brushed steel frame.'
          };
        }).filter(Boolean);

        if (sheetItems.length > 0) {
          if (sheetItems.length > 0) { VELORA_PRODUCTS.length = 0; VELORA_PRODUCTS.push(...sheetItems); window.dispatchEvent(new Event("velora:catalogUpdated")); }
          window.dispatchEvent(new Event('velora:catalogUpdated'));
        }
      })
      .catch(() => {});
  } catch (e) {}
})();



