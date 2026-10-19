import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import { Product } from '../src/models/Product.js';
import { ProductCategory } from '../src/models/ProductCategory.js';
import { AdminUser } from '../src/models/AdminUser.js';

const LIVE_PRODUCTS = [
  {
    name: "Shopping Trolley",
    slug: "shopping-trolley",
    category: "shopping-trolleys",
    categoryTitle: "Shopping Trolleys",
    image: "/images/shopping-trolley.jpg",
    shortDesc: "Commercial grade supermarket shopping cart with electro-zinc rust proof plating and smooth PU casters.",
    detailedDesc: "Manufactured with bright electro-zinc plating and anti-corrosive transparent lacquer coating. Designed for heavy retail traffic with 4 smooth swivel castor wheels, red impact corner protectors, and reinforced wire chassis.",
    specs: {
      material: "High-Tensile Tubular Steel & Chrome Wire",
      loadCapacity: "80 kg to 160 kg payload",
      finish: "Bright Zinc Plating with Rust-Resistant Clear Coat",
      wheelType: "4x 100mm PU Swivel Castor Wheels",
    },
    highlights: ["Smooth swivel maneuverability", "Red corner buffer protectors", "Heavy-duty wire basket"]
  },
  {
    name: "Display Rack",
    slug: "display-rack",
    category: "retail-display-racks",
    categoryTitle: "Retail Display Racks",
    image: "/images/display-rack.jpg",
    shortDesc: "Departmental store grocery & merchandise display racks with wooden accents and multi-tier adjustable shelves.",
    detailedDesc: "High-density retail departmental store display shelving with natural wood decorative accents, pure polyester powder-coated steel shelves, and tool-free tier height adjustability for packaged food, FMCG, and snacks.",
    specs: {
      material: "Prime Grade CRCA Steel & Finished Wood Panels",
      loadCapacity: "80 - 140 kg per shelf tier",
      finish: "Pure Polyester Epoxy Powder Coating",
      standardHeight: "1500mm / 1800mm / 2100mm",
    },
    highlights: ["Tool-free tier adjustments", "Dual side product display", "Wooden accent headers"]
  },
  {
    name: "Sheet Metal Fabrication",
    slug: "sheet-metal-fabrication",
    category: "industrial-storage",
    categoryTitle: "Industrial Storage Racks",
    image: "/images/sheet-metal-fabrication.jpg",
    shortDesc: "Custom precision sheet metal brackets, upright channels, and structural components for industrial storage.",
    detailedDesc: "Fabricated in-house using CNC turret punching, precision laser cutting, and multi-axis hydraulic press brake bending. Produced from heavy-gauge prime CRCA and IS 2062 steel sheets for OEM storage assemblies.",
    specs: {
      material: "Heavy Gauge Cold Rolled Steel (IS 2062 / IS 513 CRCA)",
      loadCapacity: "Heavy Structural Load Rating",
      finish: "Hot Dip Galvanized / Powder Coated",
      fabrication: "CNC Turret Punching, Laser Cutting & Hydraulic Bending",
    },
    highlights: ["Custom thickness 1.2mm - 3.5mm", "Precision punch tolerances", "Anti-corrosion galvanization"]
  },
  {
    name: "Metal Cabinets",
    slug: "metal-cabinets",
    category: "industrial-storage",
    categoryTitle: "Industrial Storage Racks",
    image: "/images/metal-cabinets.jpg",
    shortDesc: "Heavy-duty industrial steel storage cabinets with 3-point locking system and adjustable internal shelving.",
    detailedDesc: "Engineered for factory tool storage, industrial workshops, and archive documentation. Fabricated from 1.2mm CRCA steel sheet with internal stiffeners, three-point lock with dual keys, and oven-baked electrostatic powder coating.",
    specs: {
      material: "Prime Grade 1.2mm CRCA Steel Body",
      loadCapacity: "100 kg per shelf tier",
      finish: "7-Tank Pretreatment Electrostatic Powder Coated",
      lockType: "3-Point Central Cam Lock with Dual Keys",
    },
    highlights: ["Reinforced double doors", "Anti-pry internal hinges", "Oven-baked durable enamel"]
  },
  {
    name: "Heavy Duty Rack",
    slug: "heavy-duty-rack",
    category: "warehouse-racking",
    categoryTitle: "Warehouse Racking Systems",
    image: "/images/heavy-duty-rack.webp",
    shortDesc: "High-bay industrial warehouse pallet racking with blue structural uprights and orange cross beams.",
    detailedDesc: "High-density heavy-duty warehouse pallet storage system designed for logistics distribution centers and factory storehouses. Supports up to 3,500 kg per beam level with safety lock pins and floor expansion bolts.",
    specs: {
      material: "High-Tensile Structural Steel",
      loadCapacity: "1,000 kg – 3,500 kg per beam level",
      finish: "Electrostatic Powder Coated Uprights (Blue) & Beams (Orange)",
      standardHeight: "2,000mm up to 8,000mm",
    },
    highlights: ["Safety locking pins", "Heavy beam connectors", "Seismic floor anchor points"]
  },
  {
    name: "Retail Display Rack",
    slug: "retail-display-rack",
    category: "retail-display-racks",
    categoryTitle: "Retail Display Racks",
    image: "/images/retail-display-rack.png",
    shortDesc: "Modern black retail display shelving with overhead canopy LED lighting for supermarket beverage aisles.",
    detailedDesc: "Architectural retail merchandise display shelving featuring a contemporary matte black finish and integrated warm-white overhead canopy LED illumination. Designed for premium beverages, confectionery, and packaged retail goods.",
    specs: {
      material: "Heavy-Gauge Cold Rolled Steel (CRCA)",
      loadCapacity: "90 - 150 kg per shelf tier",
      finish: "Matte Black Pure Polyester Powder Coating",
      lighting: "Integrated Warm White LED Canopy Light Strips",
    },
    highlights: ["Overhead illuminated canopy", "High product contrast black finish", "Price ticket channel strips"]
  },
  {
    name: "Slotted Angle Rack",
    slug: "slotted-angle-rack",
    category: "industrial-storage",
    categoryTitle: "Industrial Storage Racks",
    image: "/images/slotted-angle-rack.jpg",
    shortDesc: "Heavy gauge dark grey slotted angle storage rack with multi-tier corner and wall shelving.",
    detailedDesc: "Fabricated from high-tensile cold-rolled slotted angles with corner stiffener plates for zero sway. Variable shelf pitch allows versatile storage of industrial cartons, hardware tools, and office document files.",
    specs: {
      material: "Heavy Gauge Slotted Steel Angles & Pressed Shelves",
      loadCapacity: "70 – 120 kg per shelf uniformly distributed",
      finish: "Durable Dark Grey Oven-Baked Enamel Coating",
      standardHeight: "1800mm / 2400mm",
    },
    highlights: ["Corner stiffener plates for zero sway", "Variable shelf pitch", "Easy manual assembly"]
  },
  {
    name: "Shopping Basket",
    slug: "shopping-basket",
    category: "shopping-trolleys",
    categoryTitle: "Shopping Trolleys",
    image: "/images/shopping-basket.jpg",
    shortDesc: "Ergonomic plastic shopping hand baskets with reinforced red dual carry handles for retail grocery stores.",
    detailedDesc: "Molded from 100% virgin high-density polypropylene with reinforced dual red carry handles. Perforated base provides strength and airflow, while stackable nesting structure saves floor area near supermarket entrances.",
    specs: {
      material: "100% Virgin High-Density Polypropylene (HDPE)",
      loadCapacity: "Up to 25 kg payload capacity",
      finish: "High-Gloss Anti-Scratch Finish (Black & Red)",
      capacity: "22 Litres / 28 Litres Volume",
    },
    highlights: ["Dual folding red carry handles", "Ventilated mesh base", "Stackable nesting design"]
  },
  {
    name: "Shopping Cart",
    slug: "shopping-cart",
    category: "shopping-trolleys",
    categoryTitle: "Shopping Trolleys",
    image: "/images/shopping-cart.jpg",
    shortDesc: "Standard supermarket wire shopping cart with green bumper protectors, ergonomic push handle, and child seat.",
    detailedDesc: "Classic supermarket shopping trolley cart with durable wire basket, child safety seat with folding flap, front plastic bumper protectors, and 4 quiet polyurethane 360-degree swivel wheels.",
    specs: {
      material: "Bright Zinc Plated Steel Wire with Clear Lacquer Coating",
      loadCapacity: "90 kg - 150 kg payload",
      finish: "Electro-Galvanized Mirror Chrome Finish",
      wheels: "4x 100mm Noise-Free PU Castor Wheels",
    },
    highlights: ["Folding child safety seat", "Green corner bumpers", "Nesting space-saving design"]
  },
  {
    name: "Industrial Storage Rack",
    slug: "industrial-storage-rack",
    category: "industrial-storage",
    categoryTitle: "Industrial Storage Racks",
    image: "/images/industrial-storage-rack.jpg",
    shortDesc: "Multi-tier medium duty industrial storage rack with blue slotted frame and orange shelf supports.",
    detailedDesc: "Engineered for medium-weight industrial warehousing, factory maintenance rooms, and automotive spare parts. Features boltless lock-in step beams, reinforced steel shelf decking, and anti-rust epoxy powder coating.",
    specs: {
      material: "Prime Steel Cold-Formed Upright Sections",
      loadCapacity: "300 kg – 800 kg per storage level",
      finish: "Epoxy Polyester Powder Coating (Blue/Orange)",
      standardHeight: "1800mm / 2400mm / 3000mm",
    },
    highlights: ["Boltless clip-in assembly", "Heavy steel shelf decking", "Custom depth & tier levels"]
  },
  {
    name: "Warehouse Rack",
    slug: "warehouse-rack",
    category: "warehouse-racking",
    categoryTitle: "Warehouse Racking Systems",
    image: "/images/warehouse-rack.jpg",
    shortDesc: "Heavy industrial warehouse beam racking with white shelf decking panels and blue structural uprights.",
    detailedDesc: "High-load warehouse storage rack system with cold-rolled steel drop-in decking panels. Designed for forklift operations, inventory bin storage, and heavy pallet loading in logistics centers.",
    specs: {
      material: "High Yield IS 2062 Structural Steel",
      loadCapacity: "800 kg – 2,500 kg per beam tier",
      finish: "Corrosion-Resistant Industrial Powder Coating",
      decking: "Cold Rolled Steel Deck Panels",
    },
    highlights: ["Forklift accessible layout", "Safety beam locks", "Modular extension bays"]
  },
  {
    name: "Vegetable Rack For Shop",
    slug: "vegetable-rack-for-shop",
    category: "retail-display-racks",
    categoryTitle: "Retail Display Racks",
    image: "/images/vegetable-rack-for-shop.jpg",
    shortDesc: "Multi-tier slanted grocery & produce display rack with wooden front fascia and plastic perforated vegetable crates.",
    detailedDesc: "Specialized supermarket fruit and vegetable display stand designed with inclined tiers for maximum product visibility and customer ergonomics. Accommodates standard food-grade perforated plastic crates.",
    specs: {
      material: "Heavy MS Tubular Frame with Wooden Border Accents",
      loadCapacity: "50 kg per crate tier",
      finish: "Anti-Corrosive Green / Black Powder Coating",
      design: "Slanted inclined tiers for maximum product visibility",
    },
    highlights: ["Inclined crate display angles", "Natural wood front border", "Easy-to-clean hygiene design"]
  },
  {
    name: "Plastic Shopping Basket",
    slug: "plastic-shopping-basket",
    category: "shopping-trolleys",
    categoryTitle: "Shopping Trolleys",
    image: "/images/plastic-shopping-basket.jpg",
    shortDesc: "Stackable black supermarket shopping hand basket with red dual swing handles and ventilated grid base.",
    detailedDesc: "Heavy-duty injection molded shopping basket built from impact-grade virgin polymer. Features dual swinging ergonomic handles with textured hand grip, stackable nesting design, and side branding areas.",
    specs: {
      material: "Impact-Resistant Virgin Polypropylene (PP)",
      loadCapacity: "25 kg load bearing",
      finish: "Scratch-Resistant Textured Surface",
      volume: "25 Litres Capacity",
    },
    highlights: ["Dual ergonomic grip swing handles", "Stackable nesting design", "Smooth rounded corners"]
  },
  {
    name: "Garment Display Rack",
    slug: "garment-display-rack",
    category: "retail-display-racks",
    categoryTitle: "Retail Display Racks",
    image: "/images/garment-display-rack.jpg",
    shortDesc: "Retail apparel and clothing display rack with stepped hanging bars and lower shelving tier for folded garments.",
    detailedDesc: "Showroom garment hanging fixture featuring polished chrome hanging rails and heavy-duty steel base. Designed for fashion boutiques, departmental stores, and apparel showrooms to display jackets, shirts, and jeans.",
    specs: {
      material: "Heavy Gauge Steel with Chrome Hanging Tubes",
      loadCapacity: "120 kg total hanging load",
      finish: "Orange Frame with Powder-Coated Shelving & Polished Chrome Rails",
      usage: "Apparel Boutiques, Garment Showrooms, Fashion Retail",
    },
    highlights: ["Multi-level hanging bars", "Integrated shelf for folded stock", "High-visibility retail display"]
  },
  {
    name: "Gondola Rack",
    slug: "gondola-rack",
    category: "supermarket-racks",
    categoryTitle: "Supermarket Racks",
    image: "/images/gondola-rack.jpg",
    shortDesc: "Two-sided central island supermarket gondola display shelving with purple/red price channel edging.",
    detailedDesc: "Double-sided modular island display shelving for retail supermarket aisles. Fabricated using high-grade CRCA steel with 50mm slotting pitch, reinforced bottom base shelf, and plastic ticket strip channels.",
    specs: {
      material: "Prime Grade Cold Rolled Steel (CRCA)",
      loadCapacity: "80 - 150 kg per shelf tier",
      finish: "Electrostatic Pure Polyester Epoxy Powder Coating",
      standardHeight: "1500mm / 1800mm / 2100mm",
    },
    highlights: ["Tool-free tier adjustments", "Dual side product display", "Integrated price channel holders"]
  },
  {
    name: "Cash Desk Counter",
    slug: "cash-desk-counter",
    category: "checkout-counters",
    categoryTitle: "Checkout Counters",
    image: "/images/cash-desk-counter.jpg",
    shortDesc: "Commercial POS retail checkout cash desk with stainless steel conveyor top, red steel front, and computer console.",
    detailedDesc: "Ergonomic retail cashier billing checkout desk with food-grade hairline stainless steel sliding surface, heavy-gauge red powder-coated steel chassis, integrated lockable cash drawer, and CPU cable conduits.",
    specs: {
      material: "Hairline Brushed Stainless Steel Worktop & CRCA Body",
      dimensions: "1800mm x 1000mm x 850mm",
      finish: "Glossy Red & Off-White Powder Coating",
      features: "Keyboard tray, locking cash drawer, and barcode scanner recess",
    },
    highlights: ["Ergonomic cashier legroom", "Heavy steel locking drawer", "Smooth sliding stainless worktop"]
  },
  {
    name: "Checkout Counter",
    slug: "checkout-counter",
    category: "checkout-counters",
    categoryTitle: "Checkout Counters",
    image: "/images/checkout-counter.jpg",
    shortDesc: "Heavy-duty orange supermarket checkout counter with stainless steel slide top and locking cash drawer cabinet.",
    detailedDesc: "Supermarket checkout POS counter with brushed stainless steel slide surface and heavy mild steel base finished in safety orange. Includes a multi-compartment locking cash drawer and cashier storage cubbies.",
    specs: {
      material: "Hairline Brushed Stainless Steel Top + Heavy MS Base",
      dimensions: "1800mm x 1000mm x 850mm (Customizable)",
      finish: "Safety Orange Oven-Baked Powder Coating",
      cashDrawer: "Multi-compartment note clips, coin slots with key lock",
    },
    highlights: ["Smooth product gliding worktop", "Integrated locking cash drawer", "Concealed wiring ducts"]
  },
  {
    name: "Plastic Trolley",
    slug: "plastic-trolley",
    category: "shopping-trolleys",
    categoryTitle: "Shopping Trolleys",
    image: "/images/plastic-trolley.jpg",
    shortDesc: "Modern vertical plastic supermarket basket trolley with yellow rim accent and 4 smooth rolling swivel casters.",
    detailedDesc: "Compact vertical shopping basket trolley engineered for convenience stores and hypermarkets. Deep 65-litre plastic basket format with yellow comfort rim and four 360-degree swivel rubber wheels for effortless aisle navigation.",
    specs: {
      material: "High-Impact Polypropylene (PP) Basket on Metal Base",
      loadCapacity: "40 kg payload",
      finish: "Dark Grey Body with Bright Yellow Top Rim",
      wheels: "4x 75mm Heavy-Duty Swivel Rubber Casters",
    },
    highlights: ["Deep 65L vertical basket", "Ultra-lightweight steering", "Space-efficient shopping format"]
  },
  {
    name: "Supermarket Display Rack",
    slug: "supermarket-display-rack",
    category: "supermarket-racks",
    categoryTitle: "Supermarket Racks",
    image: "/images/supermarket-display-rack.jpg",
    shortDesc: "Wall-mounted supermarket retail merchandise shelving unit with red front lips and multi-tier adjustable shelves.",
    detailedDesc: "Single-sided perimeter wall display rack designed to maximize retail store wall space. Heavy slotted steel upright columns support multiple cantilever shelf tiers equipped with front red price tag label holders.",
    specs: {
      material: "Prime CRCA Steel Panel & Slotted Uprights",
      loadCapacity: "80 - 120 kg per tier",
      finish: "Polyester Epoxy Powder Coating with Red Price Channels",
      standardHeight: "1800mm / 2100mm / 2400mm",
    },
    highlights: ["Adjustable shelf levels", "High-density merchandising", "Red price tag channels"]
  },
  {
    name: "Grocery Store Rack",
    slug: "grocery-store-rack",
    category: "supermarket-racks",
    categoryTitle: "Supermarket Racks",
    image: "/images/grocery-store-rack.jpg",
    shortDesc: "Multi-tier curved white supermarket food and grocery store display shelving with high product visibility.",
    detailedDesc: "Curved white departmental grocery store shelving unit offering wide shelf depths and high weight capacities for cereal boxes, canned items, and FMCG merchandise. Includes top dust canopy cover and modular shelf dividers.",
    specs: {
      material: "High-Grade CRCA Steel with Top Canopy Cover",
      loadCapacity: "100 - 150 kg per shelf level",
      finish: "Pure White Anti-Bacterial Powder Coating",
      shelves: "5 to 6 modular adjustable display shelves",
    },
    highlights: ["Curved modern aesthetic", "Heavy load bearing capacity", "Integrated top lighting canopy"]
  },
  {
    name: "Hand Basket",
    slug: "hand-basket",
    category: "shopping-trolleys",
    categoryTitle: "Shopping Trolleys",
    image: "/images/Hand-Basket.jpg",
    shortDesc: "Durable plastic hand shopping baskets in black and grey with dual ergonomic folding handles.",
    detailedDesc: "Lightweight retail shopping hand baskets molded with dual folding carry handles, grid perforated bottom, and reinforced upper perimeter rim. Stackable in minimal footprint near store entrance turnstiles.",
    specs: {
      material: "Reinforced Polypropylene (PP)",
      loadCapacity: "22 kg payload capacity",
      finish: "Matte Texture (Black / Grey)",
      capacity: "22 Litres Volume",
    },
    highlights: ["Dual black folding handles", "Perforated easy-to-clean grid base", "Compact nesting stackability"]
  }
];

async function syncProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rp_storage_solution';
    await mongoose.connect(mongoUri);
    console.log('[Sync] Connected to MongoDB:', mongoUri);

    let admin = await AdminUser.findOne();
    const adminId = admin ? admin._id : new mongoose.Types.ObjectId();

    // Ensure categories exist
    const categoriesMap = {};
    const categoriesList = await ProductCategory.find();
    for (const cat of categoriesList) {
      categoriesMap[cat.slug] = cat._id;
    }

    console.log('[Sync] Upserting 21 authentic live products from rpstoragesolution.com...');

    for (const item of LIVE_PRODUCTS) {
      const categoryRef = categoriesMap[item.category] || null;
      const productData = {
        name: item.name,
        slug: item.slug,
        category: item.category,
        categoryRef: categoryRef,
        categoryTitle: item.categoryTitle,
        shortDesc: item.shortDesc,
        detailedDesc: item.detailedDesc,
        images: [{ url: item.image, alt: item.name, isPrimary: true }],
        specs: item.specs,
        highlights: item.highlights,
        material: item.specs.material || 'Prime Grade CRCA Steel',
        isFeatured: true,
        isActive: true,
        status: 'published',
        publishedAt: new Date(),
        seoTitle: `${item.name} Manufacturer in Delhi | RP Storage Solution`,
        metaDescription: `${item.shortDesc} Direct factory price & fast dispatch across India from RP Storage Solution.`,
        canonicalUrl: `https://www.rpstoragesolution.com/products/${item.slug}/`,
        createdBy: adminId,
        updatedBy: adminId,
      };

      await Product.findOneAndUpdate(
        { slug: item.slug },
        productData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Sync] ✓ Synced: ${item.name} (${item.image})`);
    }

    const liveSlugs = LIVE_PRODUCTS.map((p) => p.slug);
    const deleteRes = await Product.deleteMany({ slug: { $nin: liveSlugs } });
    console.log(`[Sync] Cleaned up ${deleteRes.deletedCount} old placeholder products.`);

    const total = await Product.countDocuments({ status: 'published', isActive: true });
    console.log(`[Sync] Success! Total active published products in MongoDB: ${total}`);

    await mongoose.disconnect();
    console.log('[Sync] Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('[Sync] Error syncing products:', err);
    process.exit(1);
  }
}

syncProducts();
