import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/Product.js';
import { CityProduct } from '../src/models/CityProduct.js';
import { ProductCityMapping } from '../src/models/ProductCityMapping.js';
import { City } from '../src/models/City.js';
import { ProductCategory } from '../src/models/ProductCategory.js';

dotenv.config();

const realProductsData = [
  {
    name: 'Gondola Display Rack',
    slug: 'gondola-display-rack',
    category: 'supermarket-racks',
    categoryTitle: 'Supermarket Racks',
    shortDesc: 'Modular white supermarket wall & gondola display shelving with red price-channel lips.',
    detailedDesc: 'The RP Storage Solution Gondola Display Rack is engineered for supermarkets, grocery stores, and department outlets. Fabricated using high-grade cold rolled closed annealed (CRCA) steel, each tier supports up to 150 kg uniformly distributed load. Features electrostatic powder coat finish, modular tool-free shelf height adjustments, and prominent red price channel holders.',
    images: [{ url: '/images/gondola-display-rack-real.jpeg', alt: 'Modular Supermarket Gondola Display Rack with Red Price Strips', isPrimary: true }],
    specs: {
      material: 'Prime Grade Cold Rolled Steel (CRCA)',
      loadCapacity: '80 - 150 kg per shelf tier',
      finish: 'Pure Polyester Epoxy Powder Coating',
      standardHeight: '1500mm / 1800mm / 2100mm',
      shelfDepth: '300mm to 500mm adjustable',
    },
    features: ['Tool-free tier adjustments', 'Dual side product display', 'Integrated red price channel holders', 'Direct factory Najafgarh Delhi supply'],
    applications: ['Supermarkets', 'Hypermarkets', 'Departmental Stores', 'Kirana Outlets'],
    highlights: ['Tool-free tier adjustments', 'Dual side product display', 'Integrated red price channel holders'],
    material: 'Prime Grade CRCA Steel',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Gondola Display Racks Manufacturer Delhi | RP Storage Solution',
    metaDescription: 'Buy heavy-duty double-sided gondola display racks directly from the manufacturer in Delhi. High weight capacity, powder coated finish & direct delivery.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/gondola-display-rack/',
    status: 'published',
  },
  {
    name: 'Heavy Duty Warehouse Pallet Rack',
    slug: 'heavy-duty-warehouse-pallet-rack',
    category: 'warehouse-racking',
    categoryTitle: 'Warehouse Racking Systems',
    shortDesc: 'Industrial high-bay warehouse pallet racking with blue structural uprights and orange load cross beams.',
    detailedDesc: 'Designed for logistics parks, fulfillment hubs, and manufacturing storehouses, our heavy-duty pallet racking handles up to 3,500 kg per storage beam level with full seismic floor anchoring. Features blue powder-coated structural upright frames and heavy-gauge orange load beams with safety locking pins.',
    images: [{ url: '/images/warehouse-pallet-rack-real.jpeg', alt: 'Industrial Heavy Duty Warehouse Pallet Rack System', isPrimary: true }],
    specs: {
      material: 'High-Tensile Structural Steel',
      loadCapacity: '1,000 kg – 3,500 kg per beam level',
      finish: 'Electrostatic Powder Coated Uprights (Blue) & Beams (Orange)',
      standardHeight: '2,000mm up to 8,000mm',
      beamLengths: '2200mm, 2700mm, 3300mm',
    },
    features: ['Safety locking pins', 'Heavy beam connectors', 'Custom floor anchor points', 'Forklift friendly design'],
    applications: ['Warehouses', 'Cold Storage', 'Logistics Parks', 'Manufacturing Facilities'],
    highlights: ['Safety locking pins', 'Heavy beam connectors', 'Custom floor anchor points'],
    material: 'High-Tensile Structural Steel',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Heavy Duty Warehouse Pallet Racks Manufacturer | RP Storage Solution',
    metaDescription: 'High-bay pallet racks engineered for industrial warehouses. Load capacity up to 3,500 kg/level, seismic certified & factory direct.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/heavy-duty-warehouse-pallet-rack/',
    status: 'published',
  },
  {
    name: 'Slotted Angle Storage Rack',
    slug: 'slotted-angle-storage-rack',
    category: 'industrial-storage',
    categoryTitle: 'Industrial Storage Racks',
    shortDesc: 'Heavy gauge dark grey slotted angle storage rack with multi-tier corner and wall shelving.',
    detailedDesc: 'Manufactured from heavy gauge slotted steel angles and pressed steel panels, this versatile shelving system is ideal for industrial storerooms, spare parts inventory, documentation records, and corner storage. Features dark grey oven-baked enamel finish and corner stiffeners for zero sway.',
    images: [{ url: '/images/slotted-angle-rack-real.png', alt: 'Dark Grey Slotted Angle Industrial Storage Shelving Unit', isPrimary: true }],
    specs: {
      material: 'Heavy Gauge Slotted Steel Angles & Pressed Shelves',
      loadCapacity: '70 – 120 kg per shelf uniformly distributed',
      finish: 'Durable Dark Grey Oven-Baked Enamel Coating',
      standardHeight: '1800mm / 2400mm',
      levels: '4 to 7 adjustable tiers',
    },
    features: ['Corner stiffener plates for zero sway', 'Variable shelf pitch', 'Easy manual assembly', 'Multi-tier modular expansion'],
    applications: ['Archive Rooms', 'Auto Spare Parts', 'Hardware Stores', 'Office Storerooms', 'Factory Storerooms'],
    highlights: ['Corner stiffener plates for zero sway', 'Variable shelf pitch', 'Easy manual assembly'],
    material: 'Heavy Gauge Slotted Steel',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Slotted Angle Racks Manufacturer Delhi | RP Storage Solution',
    metaDescription: 'Heavy-duty slotted angle racks for industrial and commercial storage. Variable shelf levels, corner stiffeners & direct factory pricing.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/slotted-angle-storage-rack/',
    status: 'published',
  },
  {
    name: 'Supermarket Cash & Checkout Counter',
    slug: 'supermarket-cash-checkout-counter',
    category: 'checkout-counters',
    categoryTitle: 'Checkout Counters',
    shortDesc: 'Stainless steel worktop POS checkout desk with red steel body and integrated locking cash drawer.',
    detailedDesc: 'Engineered for rapid cashier workflows and high customer throughput, featuring brushed hairline stainless steel top slide surface, durable red powder-coated mild steel base, and an integrated multi-compartment locking cash drawer with bill hold-down clips and coin divider compartments.',
    images: [{ url: '/images/checkout-cash-counter-real.png', alt: 'Supermarket Cash and Checkout Counter with Locking Drawer', isPrimary: true }],
    specs: {
      material: 'Hairline Brushed Stainless Steel Worktop + Heavy Red MS Body',
      dimensions: '1800mm x 1000mm x 850mm (Customizable)',
      finish: 'Powder Coated Red Metal with Brushed Stainless Steel Slide Surface',
      cashDrawer: 'Multi-compartment note clips, coin slots with key lock',
      features: 'Integrated POS stand cutout, lockable storage drawer',
    },
    features: ['Smooth product gliding SS top', 'Integrated locking cash drawer', 'Concealed wiring ducts', 'Ergonomic cashier legroom'],
    applications: ['Supermarkets', 'Departmental Stores', 'Hypermarket POS', 'Grocery Cash Counters'],
    highlights: ['Smooth product gliding', 'Integrated locking cash drawer', 'Concealed wiring ducts'],
    material: 'Brushed Stainless Steel & Mild Steel',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Supermarket Cash & Checkout Counters Manufacturer | RP Storage',
    metaDescription: 'Heavy gauge stainless steel top supermarket cash counters and checkout desks. Durable metal frame, integrated locking cash drawer & factory direct.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/supermarket-cash-checkout-counter/',
    status: 'published',
  },
  {
    name: 'Heavy Duty Platform Trolley',
    slug: 'platform-trolley',
    category: 'shopping-trolleys',
    categoryTitle: 'Shopping Trolleys & Material Handling',
    shortDesc: 'Industrial flatbed platform hand truck with reinforced blue deck and folding ergonomic handle.',
    detailedDesc: 'Engineered for high-volume material handling in retail stores, warehouses, and freight hubs. Features a heavy-duty reinforced blue polymer non-skid deck, quick foot-release folding silver steel handle, and four heavy-duty polyurethane swivel castor wheels for smooth, silent transport.',
    images: [{ url: '/images/platform-trolley-real.png', alt: 'Heavy Duty Blue Platform Hand Truck Trolley with Folding Handle', isPrimary: true }],
    specs: {
      material: 'Reinforced Structural Polymer Deck & Tubular Steel Handle',
      loadCapacity: '150 kg to 300 kg payload capacity',
      finish: 'Anti-skid textured blue platform with corrosion-resistant handle',
      wheelType: '4x Heavy-Duty Swivel Polyurethane Castor Wheels',
      handle: 'Foldable ergonomic handle with foot-release mechanism',
    },
    features: ['Folding handle for space-saving storage', 'Smooth-rolling 360-degree wheels', 'Heavy payload stability', 'Scratch and corrosion resistant'],
    applications: ['Warehouses', 'Supermarket Stockrooms', 'Logistics Centers', 'Retail Floor Replenishment'],
    highlights: ['Folding handle for space-saving storage', 'Smooth-rolling 360-degree wheels', 'Heavy payload stability'],
    material: 'Reinforced Polymer & Tubular Steel',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Platform Trolley Manufacturer Delhi | RP Storage Solution',
    metaDescription: 'Industrial heavy duty platform trolleys and flatbed hand trucks. Foldable steel handle, anti-skid blue deck & direct factory rates.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/platform-trolley/',
    status: 'published',
  },
  {
    name: 'Retail Garment & Apparel Display Rack',
    slug: 'retail-garment-display-rack',
    category: 'retail-display-racks',
    categoryTitle: 'Retail Display Racks',
    shortDesc: 'Showroom garment hanging fixtures and perimeter wall display shelving for apparel stores.',
    detailedDesc: 'Modern showroom apparel display fixtures featuring heavy-gauge powder-coated white frames, polished chrome clothing hanging rails, integrated header signage brackets, and folded garment display tiers for clothing boutiques and department stores.',
    images: [{ url: '/images/garment-display-rack-real.jpeg', alt: 'Modern Retail Garment and Apparel Display Rack Fixture', isPrimary: true }],
    specs: {
      material: 'Heavy-Gauge Powder Coated MS & Chrome Hanging Rails',
      finish: 'Pure White & Chrome Modern Architectural Finish',
      height: '2100mm / 2400mm modular wall fixtures',
      accessories: 'Integrated price signage frames, folded garment shelves, hanging rails',
    },
    features: ['High-density apparel hanging capacity', 'Perimeter wall rail mounting', 'Integrated price signage displays', 'Modern architectural aesthetic'],
    applications: ['Fashion Boutiques', 'Departmental Stores', 'Garment Showrooms', 'Retail Apparel Outlets'],
    highlights: ['High-density apparel hanging capacity', 'Perimeter wall rail mounting', 'Integrated price signage displays'],
    material: 'Powder Coated MS & Chrome Steel',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Retail Garment Display Racks Manufacturer Delhi | RP Storage',
    metaDescription: 'Architectural apparel and garment display racks for clothing stores and showrooms. Heavy hanging capacity, premium finish & factory direct.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/retail-garment-display-rack/',
    status: 'published',
  },
  {
    name: 'Square Wire Mesh Promotional Dump Bin',
    slug: 'square-wire-promotional-dump-bin',
    category: 'retail-display-racks',
    categoryTitle: 'Retail Display Racks',
    shortDesc: 'Collapsible square chrome wire mesh dump bin with folding stand for retail discount promotions.',
    detailedDesc: 'Fabricated from high-strength electro-plated chrome steel wire, this square promotional dump bin features a collapsible folding tubular stand for rapid setup during seasonal discount sales and impulse promotional merchandising in supermarket aisles.',
    images: [{ url: '/images/square-wire-dump-bin-real.png', alt: 'Square Chrome Wire Mesh Promotional Dump Bin on Folding Stand', isPrimary: true }],
    specs: {
      material: 'Heavy-Gauge Electro-Plated Chrome Steel Wire',
      stand: 'Folding Tubular Steel Chrome Base Stand',
      meshGrid: 'High-strength welded wire grid with reinforced corners',
      capacity: 'Up to 60 kg distributed promotional merchandise',
    },
    features: ['Collapsible folding stand', 'High-visibility impulse display', 'Corrosion-resistant bright chrome plating', 'Quick assembly without tools'],
    applications: ['Supermarkets', 'Hypermarket Promo Aisles', 'Discount Clothing Stores', 'Mall Impulse Zones'],
    highlights: ['Collapsible folding stand', 'High-visibility impulse display', 'Corrosion-resistant bright chrome plating'],
    material: 'Electro-Plated Chrome Steel Wire',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Promotional Wire Mesh Dump Bins Manufacturer | RP Storage',
    metaDescription: 'Square chrome wire mesh dump bins on folding stands for retail promotions and clearance sales. Heavy duty wire construction & direct supply.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/square-wire-promotional-dump-bin/',
    status: 'published',
  },
  {
    name: 'Round Wire Display Basket',
    slug: 'round-wire-display-basket',
    category: 'retail-display-racks',
    categoryTitle: 'Retail Display Racks',
    shortDesc: 'Tapered circular chrome wire mesh impulse display basket on sturdy floor stand.',
    detailedDesc: 'Tapered circular chrome wire dump bin designed for impulse merchandise at supermarket checkout queues and high-traffic retail aisles. Offers full 360-degree customer accessibility with heavy circular wire base and mirror chrome finish.',
    images: [{ url: '/images/round-wire-basket-real.png', alt: 'Round Chrome Wire Display Basket and Dump Bin Stand', isPrimary: true }],
    specs: {
      material: 'Bright Chrome-Plated Cold Drawn Steel Wire',
      design: 'Tapered round circular dump bin basket',
      base: 'Integrated circular wire floor support base',
      usage: 'Aisle-end and checkout impulse retail merchandising',
    },
    features: ['360-degree customer accessibility', 'Lightweight yet sturdy steel construction', 'Mirror chrome finish', 'Ideal for impulse retail items'],
    applications: ['Supermarket Checkouts', 'Kirana Stores', 'Convenience Outlets', 'Pharmacies'],
    highlights: ['360-degree customer accessibility', 'Lightweight yet sturdy steel construction', 'Mirror chrome finish'],
    material: 'Bright Chrome-Plated Steel Wire',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Round Wire Display Baskets & Dump Bins | RP Storage Solution',
    metaDescription: 'Circular chrome wire display baskets and impulse dump bins for retail stores. 360 degree visibility, heavy wire build & direct pricing.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/round-wire-display-basket/',
    status: 'published',
  },
  {
    name: 'Commercial Shopping Trolley',
    slug: 'ergonomic-shopping-trolley',
    category: 'shopping-trolleys',
    categoryTitle: 'Shopping Trolleys',
    shortDesc: 'Commercial grade supermarket shopping cart with electro-zinc rust proof plating.',
    detailedDesc: 'Built with cold-drawn mild steel wire and seamless oval tubing, our shopping trolleys feature 100mm polyurethane swivel wheels for effortless maneuverability and zero floor marking.',
    images: [{ url: '/images/Trolley.jpg', alt: 'Commercial Supermarket Shopping Trolley', isPrimary: true }],
    specs: {
      material: 'Cold Drawn Mild Steel Wire & Oval Tubing',
      loadCapacity: '100 kg to 160 kg payload',
      finish: 'Bright Zinc Plating with Transparent Lacquer',
      wheelType: '4x 100mm High-Grade Polyurethane Swivel Castors',
      features: 'Plastic corner bumpers, ergonomically angled handle',
    },
    features: ['Nest-compact design', 'Whisper-quiet wheel roll', 'Corrosion resistant under heavy washing'],
    applications: ['Supermarkets', 'Grocery Stores', 'Malls', 'Hypermarkets'],
    highlights: ['Nest-compact design', 'Whisper-quiet wheel roll', 'Corrosion resistant under heavy washing'],
    material: 'Cold Drawn Mild Steel Wire',
    isFeatured: true,
    isActive: true,
    seoTitle: 'Supermarket Shopping Trolleys Manufacturer | RP Storage Solution',
    metaDescription: 'Premium zinc-plated shopping trolleys for supermarkets and malls. Smooth swivel wheels, heavy payload capacity & long-lasting finish.',
    canonicalUrl: 'https://www.rpstoragesolution.com/products/ergonomic-shopping-trolley/',
    status: 'published',
  }
];

async function syncData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rp_storage_solution';
    await mongoose.connect(mongoUri);
    console.log('[Sync] Connected to MongoDB:', mongoUri);

    // 1. Upsert Products
    const syncedProducts = [];
    for (const prod of realProductsData) {
      const updated = await Product.findOneAndUpdate(
        { slug: prod.slug },
        { $set: prod },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      syncedProducts.push(updated);
      console.log(`[Sync] Updated product: ${updated.name} (${updated.slug}) -> image: ${updated.images[0]?.url}`);
    }

    // 2. Ensure all verified cities have ProductCityMapping for all synced products
    const cities = await City.find({ serviceAvailability: 'verified' });
    console.log(`[Sync] Found ${cities.length} verified cities.`);

    let mappingCount = 0;
    for (const city of cities) {
      for (const prod of syncedProducts) {
        await ProductCityMapping.findOneAndUpdate(
          { city: city._id, product: prod._id },
          {
            $set: {
              isAvailable: true,
              availabilityNotes: `Direct factory dispatch and turnkey assembly in ${city.name}.`,
            }
          },
          { upsert: true }
        );
        mappingCount++;
      }
    }
    console.log(`[Sync] Ensured ${mappingCount} ProductCityMapping records.`);

    // 3. Update existing CityProduct records with accurate product names and images
    const cityProducts = await CityProduct.find({});
    console.log(`[Sync] Checking ${cityProducts.length} CityProduct landing pages...`);
    for (const cp of cityProducts) {
      const matchingProd = syncedProducts.find(p => p.slug === cp.productSlug);
      if (matchingProd) {
        cp.productName = matchingProd.name;
        cp.h1Heading = `${matchingProd.name} in ${cp.cityName}`;
        cp.seoTitle = `${matchingProd.name} in ${cp.cityName} | Direct Factory Pricing | RP Storage`;
        await cp.save();
        console.log(`[Sync] Updated CityProduct: ${cp.slug} (${cp.productName})`);
      }
    }

    console.log('[Sync] All real product images and content synchronized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Sync] Error syncing data:', err);
    process.exit(1);
  }
}

syncData();
