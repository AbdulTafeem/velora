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
    price: 4999,
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
    price: 5499,
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
    price: 6499,
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
    price: 5999,
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
    price: 7499,
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
    price: 4299,
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




