import { Product, ProductVariant, Review } from '../types';

interface CategoryConfig {
  id: string;
  sellerId: string;
  sellerName: string;
  images: string[];
  adjectives: string[];
  nouns: string[];
  specs: string[];
  basePriceRange: [number, number];
  isB2BDefault?: boolean;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'Electronics & Gadgets',
    sellerId: 'seller_1',
    sellerName: 'TechNova Official Store',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    ],
    adjectives: ['AeroSound Pro', 'Chronos Ultra', 'Quantum-X', 'Vanguard', 'HyperSpeed 7', 'NovaStudio', 'Titanium', 'Apex HD'],
    nouns: ['Active Noise Cancelling Headphones', 'AMOLED Smartwatch with GPS', 'Mechanical 75% Custom Keyboard', '4K OLED Portable Monitor', 'Studio Hi-Fi Soundbar System', '10,000mAh MagSafe Battery Pack', '65W GaN Fast Charger Dock', 'Ultralight Ergonomic Gaming Mouse'],
    specs: ['Bluetooth 5.3', 'USB-C Fast Charging', '40-Hour Battery Life', 'Aerospace Grade Aluminum Case', 'IP68 Water Resistance'],
    basePriceRange: [39.99, 449.0],
  },
  {
    id: 'Fashion & Apparel',
    sellerId: 'seller_3',
    sellerName: 'Velvet & Co. Apparel',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80',
    ],
    adjectives: ['Heritage', 'Artisan', 'Tailored', 'Essential', 'Milano', 'Nordic', 'Oxford Classic', 'Velvet Deluxe'],
    nouns: ['Full-Grain Leather Weekender Bag', 'Merino Wool Crewneck Sweater', 'Relaxed-Fit Linen Button-Down Shirt', 'Selvedge Tapered Denim Jeans', 'Cashmere Fringed Winter Scarf', 'Minimalist Analog Dress Watch', 'Waterproof Trench Coat', 'Suede Leather Chelsea Boots'],
    specs: ['100% Organic Fiber', 'Hand-Stitched Finish', 'Italian Leather Trim', 'Dry Clean Recommended', 'Breathable Weave'],
    basePriceRange: [28.0, 320.0],
  },
  {
    id: 'Home & Living',
    sellerId: 'seller_2',
    sellerName: 'Artisan Atelier & Home',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    ],
    adjectives: ['Nordic', 'Wabi-Sabi', 'Artisan', 'Hand-Thrown', 'Scandinavian', 'Kinfolk', 'Minimalist', 'Kyoto'],
    nouns: ['Terracotta Ceramic Vase Set (3-Piece)', 'Solid Oak & Brass Desk Lamp', 'Stainless Steel Espresso Maker', 'Linen Duvet Cover & Pillowcase Set', 'Hand-Poured Soy Wax Scented Candle', 'Enameled Cast Iron Dutch Oven Skillet', 'Acacia Wood End-Grain Cutting Board', 'Japanese Stoneware Teapot & Mug Set'],
    specs: ['Solid Kiln-Dried Wood', 'Non-Toxic Food Safe Finish', 'Sustainably Harvested Materials', 'Artisan Hand-Glazed', '2-Year Replacement Warranty'],
    basePriceRange: [32.0, 290.0],
  },
  {
    id: 'Beauty & Health',
    sellerId: 'seller_3',
    sellerName: 'Velvet & Co. Apparel',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    ],
    adjectives: ['Lumière', 'Bio-Active', 'Botanical', 'Pure Glow', 'DermaCraft', 'Elixir', 'Holistic', 'Cellular'],
    nouns: ['2% Hyaluronic Acid & Peptide Serum (50ml)', 'Vitamin C Radiance Glow Facial Oil', 'Green Tea Purifying Clay Facial Mask', 'Natural Jade Sculpting Facial Roller Set', '100% Pure Mulberry Silk Sleep Mask', 'Organic Rosehip & Squalane Moisturizer', 'Ultrasonic Gentle Silicone Facial Cleanser', 'Essential Oil Ultrasonic Diffuser'],
    specs: ['Dermatologist Tested', '100% Vegan & Cruelty-Free', 'No Parabens or Sulfates', 'Recyclable Amber Glass Bottle', 'Organic Botanical Extracts'],
    basePriceRange: [18.0, 95.0],
  },
  {
    id: 'Books & Collectibles',
    sellerId: 'seller_2',
    sellerName: 'Artisan Atelier & Home',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
    ],
    adjectives: ['First Edition', 'Archival', 'Limited Run', 'Curator Series', 'Bauhaus', 'Mid-Century', 'Monograph', 'Vintage'],
    nouns: ['Leatherbound Literary Classic (Slipcase Edition)', 'Bauhaus Architecture & Design Monograph', 'Japanese Modernist Woodblock Art Print', 'Audiophile Vinyl Record Box Set (180g)', 'Hardcover Industrial Design Retrospective', 'Hand-Numbered Archival Art Lithograph', 'Vintage Horology & Mechanical Watch Catalog', 'Photography & Light Exhibition Art Book'],
    specs: ['Archival Acid-Free Paper', 'Linen-Bound Hardcover', 'Includes Slipcase & Ribbon Marker', 'Limited to 1,000 Copies', 'High-Resolution Pigment Print'],
    basePriceRange: [35.0, 190.0],
  },
  {
    id: 'B2B Bulk Supplies',
    sellerId: 'seller_4',
    sellerName: 'GlobalTrade B2B Supplies Ltd.',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
    ],
    adjectives: ['Wholesale Kraft', 'Industrial Heavy-Duty', 'Eco-Fiber', 'Commercial Grade', 'Logistics Pro', 'FSC-Certified', 'Warehouse Master', 'Bulk Trade'],
    nouns: ['Corrugated Kraft Shipping Boxes (Pack of 100)', 'Heavy-Duty Packaging Tape Dispensers (Case of 12)', 'Eco-Friendly Kraft Bubble Mailers (500-Pack)', 'Commercial Thermal Shipping Label Rolls (24-Roll Case)', 'Ergonomic Steel Safety Box Cutters (12-Pack)', 'Biodegradable Cornstarch Packing Peanuts (5-Bushel Bag)', 'Industrial Heavy-Duty Pallet Shrink Wrap (4-Roll Pack)', 'Stackable Polypropylene Storage Bins (10-Set)'],
    specs: ['100% FSC Recycled Fiber', 'Master Carton Bulk Wholesale', 'Custom Logo Stamp Compatible', 'ISO-9001 Quality Assured', 'Heavy-Duty 3-Ply E-Flute'],
    basePriceRange: [85.0, 480.0],
    isB2BDefault: true,
  },
];

const REVIEWS_POOL = [
  {
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    comment: 'Exceptional quality! The packaging was secure and arrived two days ahead of schedule. Highly recommend this seller.',
    rating: 5,
  },
  {
    userName: 'Marcus Vance',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    comment: 'Very solid build and works exactly as described. Worth every dollar.',
    rating: 5,
  },
  {
    userName: 'Ayesha Rahman',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    comment: 'Beautiful finish and great attention to detail. Will definitely order from this store again.',
    rating: 5,
  },
  {
    userName: 'David K.',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    comment: 'Good value for money. Looks great and feels premium in hand.',
    rating: 4,
  },
];

const VARIANT_COLORS = [
  { name: 'Obsidian Black', skuSuffix: 'BLK' },
  { name: 'Scandinavian Slate', skuSuffix: 'SLT' },
  { name: 'Warm Terracotta', skuSuffix: 'TER' },
  { name: 'Brushed Stainless', skuSuffix: 'STL' },
  { name: 'Cognac Leather', skuSuffix: 'COG' },
  { name: 'Midnight Navy', skuSuffix: 'NVY' },
  { name: 'Nordic Sand', skuSuffix: 'SND' },
  { name: 'Oatmeal Natural', skuSuffix: 'OAT' },
];

/**
 * Generates exactly 1,000 unique, realistic marketplace products
 * evenly distributed across the 6 categories (~167 items per category).
 */
export function generate1000Products(): Product[] {
  const products: Product[] = [];
  const totalCount = 1000;
  const categoriesCount = CATEGORY_CONFIGS.length;

  for (let i = 0; i < totalCount; i++) {
    const catIdx = i % categoriesCount;
    const cat = CATEGORY_CONFIGS[catIdx];

    const adjIdx = (Math.floor(i / categoriesCount) * 3 + i) % cat.adjectives.length;
    const nounIdx = (Math.floor(i / categoriesCount) + i * 2) % cat.nouns.length;

    const adj = cat.adjectives[adjIdx];
    const noun = cat.nouns[nounIdx];
    const seriesNumber = 100 + (i % 900);
    const title = `${adj} ${noun} (Series ${seriesNumber})`;
    const slug = `${adj.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${noun
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-${seriesNumber}`;

    const priceSpan = cat.basePriceRange[1] - cat.basePriceRange[0];
    const rawPrice = cat.basePriceRange[0] + ((i * 17) % 100) * (priceSpan / 100);
    const basePriceUSD = parseFloat(rawPrice.toFixed(2));

    const isFlashSale = i % 5 === 0;
    const discountPercent = isFlashSale ? [10, 15, 20, 25][i % 4] : undefined;
    const isB2BEligible = cat.isB2BDefault || i % 7 === 0;
    const moq = isB2BEligible ? (i % 3 === 0 ? 10 : 5) : undefined;

    const img1 = cat.images[i % cat.images.length];
    const img2 = cat.images[(i + 3) % cat.images.length];

    const color1 = VARIANT_COLORS[i % VARIANT_COLORS.length];
    const color2 = VARIANT_COLORS[(i + 4) % VARIANT_COLORS.length];
    const variants: ProductVariant[] = [
      {
        id: `var_gen_${i}_1`,
        name: color1.name,
        sku: `BZ-${catIdx}-${seriesNumber}-${color1.skuSuffix}`,
        priceDelta: 0,
        stockQty: 25 + (i % 60),
      },
      {
        id: `var_gen_${i}_2`,
        name: color2.name,
        sku: `BZ-${catIdx}-${seriesNumber}-${color2.skuSuffix}`,
        priceDelta: i % 3 === 0 ? 15 : 0,
        stockQty: 10 + (i % 30),
      },
    ];

    const revTemplate1 = REVIEWS_POOL[i % REVIEWS_POOL.length];
    const reviews: Review[] = [
      {
        id: `rev_gen_${i}_1`,
        userId: `usr_${100 + (i % 50)}`,
        userName: revTemplate1.userName,
        userAvatar: revTemplate1.userAvatar,
        rating: revTemplate1.rating,
        comment: revTemplate1.comment,
        date: `${(i % 14) + 1} days ago`,
        verifiedPurchase: true,
        helpfulCount: 5 + (i % 25),
      },
    ];

    const rating = parseFloat((4.4 + ((i * 3) % 6) * 0.1).toFixed(1));
    const reviewCount = 18 + ((i * 7) % 280);

    const tags = [
      cat.id.toLowerCase().split(' ')[0],
      adj.toLowerCase(),
      noun.toLowerCase().split(' ')[0],
      'verified',
      isB2BEligible ? 'wholesale' : 'retail',
    ];

    const attributes: Record<string, string> = {
      Category: cat.id,
      Brand: cat.sellerName,
      Specification: cat.specs[i % cat.specs.length],
      Warranty: i % 2 === 0 ? '2-Year Manufacturer Warranty' : '1-Year Limited Warranty',
      Shipping: 'Dispatched via Bazaario Express Courier',
    };

    products.push({
      id: `prod_gen_${(i + 1).toString().padStart(4, '0')}`,
      title,
      slug,
      category: cat.id,
      sellerId: cat.sellerId,
      sellerName: cat.sellerName,
      basePriceUSD,
      discountPercent,
      isFlashSale,
      isB2BEligible,
      moq,
      images: [img1, img2],
      description: `Experience the exceptional craftsmanship of the ${title}. Engineered for reliability and style by ${cat.sellerName}, featuring premium materials, strict quality control, and buyer protection.`,
      attributes,
      variants,
      rating,
      reviewCount,
      reviews,
      inStock: true,
      tags,
      createdAt: `2026-07-${String((i % 28) + 1).padStart(2, '0')}`,
    });
  }

  return products;
}

export const GENERATED_1000_PRODUCTS: Product[] = generate1000Products();
