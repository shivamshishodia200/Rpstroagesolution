import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { AdminUser } from './models/AdminUser.js';
import { State } from './models/State.js';
import { City } from './models/City.js';
import { ProductCategory } from './models/ProductCategory.js';
import { Product } from './models/Product.js';
import { CityProduct } from './models/CityProduct.js';
import { ProductCityMapping } from './models/ProductCityMapping.js';
import { HomepageContent } from './models/HomepageContent.js';
import { SiteSettings } from './models/SiteSettings.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rp_storage_solution';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB:', mongoUri);

    // 1. Seed Admin Users
    console.log('[Seed] Creating Admin Users...');
    const salt = await bcrypt.genSalt(10);
    const superAdminPassword = await bcrypt.hash('Admin@RP2026!', salt);
    const seoManagerPassword = await bcrypt.hash('Seo@RP2026!', salt);
    const editorPassword = await bcrypt.hash('Editor@RP2026!', salt);

    await AdminUser.deleteMany({});
    const superAdmin = await AdminUser.create({
      name: 'Rajesh Sharma (Super Admin)',
      email: 'admin@rpstorage.com',
      passwordHash: superAdminPassword,
      role: 'super_admin',
      isActive: true,
    });

    const seoManager = await AdminUser.create({
      name: 'Vikas Mehra (SEO Lead)',
      email: 'seo@rpstorage.com',
      passwordHash: seoManagerPassword,
      role: 'seo_manager',
      isActive: true,
    });

    await AdminUser.create({
      name: 'Pooja Verma (Content Editor)',
      email: 'editor@rpstorage.com',
      passwordHash: editorPassword,
      role: 'content_editor',
      isActive: true,
    });
    console.log('[Seed] Users seeded successfully.');

    // 2. Seed States
    await State.deleteMany({});
    await State.create([
      { name: 'Delhi NCR', code: 'DL', country: 'India', isActive: true },
      { name: 'Haryana', code: 'HR', country: 'India', isActive: true },
      { name: 'Uttar Pradesh', code: 'UP', country: 'India', isActive: true },
    ]);

    // 3. Seed Verified Candidate Cities
    console.log('[Seed] Seeding verified candidate cities...');
    await City.deleteMany({});
    const citiesData = [
      {
        name: 'Delhi',
        slug: 'delhi',
        state: 'Delhi NCR',
        serviceAvailability: 'verified',
        verificationNotes: 'Direct plant location in Najafgarh, New Delhi. Daily dispatch and on-site assembly team available across all Delhi zones.',
        isVerified: true,
        featuredImage: '/images/banner3.jpeg',
        imageAlt: 'RP Storage Solution Supermarket and Industrial Racks Delhi',
        description: 'Premier manufacturer and direct factory supplier of heavy-duty supermarket racks, display shelving, and warehouse racking across New Delhi and Old Delhi retail markets.',
        localRelevance: 'Supplying prominent retail and industrial hubs including Okhla Industrial Area, Mayapuri, Kirti Nagar, Naraina, Chandni Chowk, and Nangali Sakrawati.',
        h1Heading: 'Best Supermarket & Storage Racks Manufacturer in Delhi',
        introContent: 'RP Storage Solution is Delhi’s leading manufacturer and supplier of heavy-duty supermarket display racks, retail grocery shelving, and industrial warehouse pallet racking systems. Operating from our manufacturing base in Najafgarh, New Delhi, we provide direct factory pricing, tailored layout blueprints, and certified load-bearing steel systems.',
        serviceDetails: 'Same-day spatial measurement surveys, rapid local dispatch within 24-48 hours, turnkey installation with experienced technicians, and direct factory warranty.',
        faqs: [
          {
            question: 'Where is your factory located in Delhi?',
            answer: 'Our main manufacturing facility is situated at Plot At, Kh No. 13/7, Village Nangali Sakrawati, Najafgarh, New Delhi - 110043. Clients are welcome to visit our fabrication line by prior appointment.',
          },
          {
            question: 'What types of supermarket racks do you deliver across Delhi?',
            answer: 'We manufacture double-sided Gondola display racks, wall-mounted display racks, grocery racks, garment display racks, cash counters, and shopping trolleys with customized tier heights.',
          },
          {
            question: 'Do you offer installation services in Delhi NCR?',
            answer: 'Yes, our in-house installation crew handles complete on-site erection, leveling, and safety anchoring for retail stores and commercial warehouses across Delhi.',
          },
        ],
        seoTitle: 'Best Supermarket Racks Manufacturers in Delhi | RP Storage Solution',
        metaDescription: 'RP Storage Solution is the leading manufacturer of supermarket racks, retail store racks & warehouse storage systems in Delhi. Direct factory pricing & installation.',
        canonicalUrl: 'https://www.rpstoragesolution.com/locations/delhi/',
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
      {
        name: 'Noida',
        slug: 'noida',
        state: 'Uttar Pradesh',
        serviceAvailability: 'verified',
        verificationNotes: 'Verified delivery corridor via DND Flyway and Greater Noida Expressway. Regular warehouse installations in Sector 63 and Phase 2.',
        isVerified: true,
        featuredImage: '/images/banner1.jpeg',
        imageAlt: 'Warehouse Pallet Racks and Retail Shelving Noida',
        description: 'Engineered heavy-duty warehouse racking and modern retail display systems for hypermarkets, ecommerce fulfillment hubs, and retail chains in Noida.',
        localRelevance: 'Active installations across Sector 63, Sector 62, Sector 83, Phase 2 Hosiery Complex, and Sector 18 Commercial Hub.',
        h1Heading: 'Heavy Duty Warehouse & Retail Racks in Noida',
        introContent: 'Empowering Noida’s burgeoning retail and logistics sectors, RP Storage Solution delivers custom-engineered pallet racking, multi-tier mezzanine shelving, and aesthetic supermarket displays built to withstand continuous industrial utilization.',
        serviceDetails: 'Prompt delivery across all Noida industrial sectors, customized load ratings up to 3,500 kg per pallet tier, and 8-tank powder coat rust prevention.',
        faqs: [
          {
            question: 'Can you deliver heavy-duty pallet racks to Sector 63, Noida?',
            answer: 'Yes, we supply and erect heavy-duty warehouse pallet racks across Sector 63, Sector 68, Phase 2, and all major Noida industrial parks with prompt transit from our Delhi plant.',
          },
          {
            question: 'What is the lead time for retail store shelving in Noida?',
            answer: 'Standard modular supermarket racks are dispatched within 2 to 4 working days, while custom powder-coated units are manufactured and delivered within 7 to 10 days.',
          },
        ],
        seoTitle: 'Warehouse Racking & Supermarket Display Racks in Noida | RP Storage',
        metaDescription: 'Top-rated warehouse pallet racks & supermarket display shelving supplier in Noida. Custom dimensions, high load capacity & direct factory rates.',
        canonicalUrl: 'https://www.rpstoragesolution.com/locations/noida/',
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
      {
        name: 'Gurugram',
        slug: 'gurugram',
        state: 'Haryana',
        serviceAvailability: 'verified',
        verificationNotes: 'Direct logistics access via Dwarka Expressway & NH-48. Verified servicing of Manesar warehousing and Cyber City commercial retail.',
        isVerified: true,
        featuredImage: '/images/banner2.jpeg',
        imageAlt: 'Commercial Supermarket Display Racks Gurugram',
        description: 'High-end retail supermarket shelving, department store display fixtures, and industrial storage racks for Gurugram enterprises.',
        localRelevance: 'Supplying major hubs across Udyog Vihar, IMT Manesar, Sector 18, Sohna Road logistics parks, and Golf Course Road retail outlets.',
        h1Heading: 'Premium Retail Shelving & Industrial Racks in Gurugram',
        introContent: 'Designed for modern retail aesthetics and high-density warehouse storage, RP Storage Solution supplies Gurugram’s commercial centers with architectural-grade gondolas, apparel racks, and structural pallet racking systems.',
        serviceDetails: 'On-site technical surveys, 3D CAD layout planning, custom color matching, and heavy-payload floor anchoring.',
        faqs: [
          {
            question: 'Do you supply shopping trolleys and checkout desks in Gurugram?',
            answer: 'Yes, we supply complete turnkey supermarket equipment including zinc-plated shopping trolleys, plastic baskets, and stainless steel POS cash counters across Gurugram.',
          },
          {
            question: 'Are your warehouse racks suitable for forklift operations in Manesar?',
            answer: 'Absolutely. Our heavy-duty pallet racks feature certified column uprights, heavy beam connectors, and floor anchor bolts tested for direct reach-truck and forklift interaction.',
          },
        ],
        seoTitle: 'Supermarket Racks & Industrial Storage Systems in Gurugram | RP Storage',
        metaDescription: 'Leading manufacturer of premium supermarket shelving, display racks & warehouse storage solutions in Gurugram & IMT Manesar.',
        canonicalUrl: 'https://www.rpstoragesolution.com/locations/gurugram/',
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
      {
        name: 'Ghaziabad',
        slug: 'ghaziabad',
        state: 'Uttar Pradesh',
        serviceAvailability: 'verified',
        verificationNotes: 'Direct connectivity via Delhi-Meerut Expressway. Certified servicing of Sahibabad, Mohan Nagar, and Bulandshahr Road industrial corridors.',
        isVerified: true,
        featuredImage: '/images/banner4.jpeg',
        imageAlt: 'Industrial Storage Racks Ghaziabad',
        description: 'Robust slotted angle shelving, heavy-duty warehouse racking, and supermarket display systems for retail and manufacturing units in Ghaziabad.',
        localRelevance: 'Established clients in Sahibabad Industrial Area, Mohan Nagar, Loni Road, Bulandshahr Road, and Raj Nagar Extension.',
        h1Heading: 'Industrial Storage Racks & Supermarket Shelving in Ghaziabad',
        introContent: 'Serving Ghaziabad’s manufacturing heartland and expanding retail markets with durable, cost-effective storage solutions fabricated from certified prime-grade steel sheets.',
        serviceDetails: 'Fast transit, heavy gauge slotted angles, custom load specifications, and dedicated installation support.',
        faqs: [
          {
            question: 'What gauge thickness do you use for slotted angle racks in Ghaziabad?',
            answer: 'We manufacture slotted angles in heavy gauges from 1.6mm up to 2.5mm thickness, paired with reinforced pressed steel shelves for maximum uniform load distribution.',
          },
        ],
        seoTitle: 'Industrial Storage Racks & Retail Shelving in Ghaziabad | RP Storage',
        metaDescription: 'Best industrial storage racks, slotted angle racks & supermarket displays in Ghaziabad. Direct manufacturer pricing & fast delivery.',
        canonicalUrl: 'https://www.rpstoragesolution.com/locations/ghaziabad/',
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
      {
        name: 'Greater Noida',
        slug: 'greater-noida',
        state: 'Uttar Pradesh',
        serviceAvailability: 'verified',
        verificationNotes: 'Serviced directly via Noida-Greater Noida Expressway. Verified installations in Ecotech and Kasna logistics zones.',
        isVerified: true,
        featuredImage: '/images/banner3.jpeg',
        imageAlt: 'Logistics Warehouse Racks Greater Noida',
        description: 'High-density warehousing infrastructure, cantilever racks, and retail supermarket display racks for Greater Noida enterprises.',
        localRelevance: 'Supplying facilities in Ecotech I, II & III, Kasna Industrial Area, Surajpur, and Knowledge Park commercial centers.',
        h1Heading: 'Logistics Warehouse Racking & Retail Displays in Greater Noida',
        introContent: 'Optimizing cubic storage volume for Greater Noida’s expansive logistics parks and modern departmental stores with heavy-duty structural racking systems.',
        serviceDetails: 'Turnkey warehouse fitouts, seismic load engineering, automated roll-formed uprights, and nationwide logistics dispatch.',
        faqs: [
          {
            question: 'Can you install multi-tier mezzanine floors in Greater Noida warehouses?',
            answer: 'Yes, our structural engineering team designs and erects multi-tier racking mezzanines that double or triple usable floor space in high-ceiling facilities.',
          },
        ],
        seoTitle: 'Warehouse Pallet Racks & Supermarket Shelving Greater Noida | RP Storage',
        metaDescription: 'High-bay warehouse pallet racking & retail display racks manufacturer in Greater Noida & Ecotech. Certified engineering & direct factory rates.',
        canonicalUrl: 'https://www.rpstoragesolution.com/locations/greater-noida/',
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
      {
        name: 'Faridabad',
        slug: 'faridabad',
        state: 'Haryana',
        serviceAvailability: 'verified',
        verificationNotes: 'Accessible via Delhi-Mathura Road and Badarpur border. Frequent shipments to NIT Faridabad and Sector 24/58 manufacturing belts.',
        isVerified: true,
        featuredImage: '/images/banner1.jpeg',
        imageAlt: 'Storage and Display Racks Faridabad',
        description: 'Durable industrial metal cabinets, sheet metal shelving, and supermarket grocery display racks for Faridabad businesses.',
        localRelevance: 'Active installations across NIT Faridabad, Sector 24, Sector 58, Ballabhgarh, and Prithla industrial corridor.',
        h1Heading: 'Durable Storage Racks & Retail Displays in Faridabad',
        introContent: 'Supplying Faridabad’s automotive, manufacturing, and commercial retail businesses with rugged, powder-coated racking systems engineered for high weight capacities.',
        serviceDetails: 'Direct truck dispatch, heavy sheet metal fabrication, custom drawer cabinets, and on-site assembly.',
        faqs: [
          {
            question: 'Do you manufacture custom metal cabinets for industrial tool storage in Faridabad?',
            answer: 'Yes, we fabricate heavy gauge 1.2mm CRCA steel tool cabinets with 3-point central cam locking systems designed for rough factory shopfloor conditions.',
          },
        ],
        seoTitle: 'Storage Racks & Retail Supermarket Racks in Faridabad | RP Storage',
        metaDescription: 'Leading storage racks, slotted angle racks & supermarket shelving manufacturer in Faridabad. Direct factory supply and professional installation.',
        canonicalUrl: 'https://www.rpstoragesolution.com/locations/faridabad/',
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
    ];

    const seededCities = await City.create(citiesData);
    console.log(`[Seed] Seeded ${seededCities.length} verified candidate cities.`);

    // 4. Seed Product Categories
    await ProductCategory.deleteMany({});
    await ProductCategory.create([
      { name: 'Supermarket Racks', slug: 'supermarket-racks', description: 'Gondola and wall retail display shelving', order: 1 },
      { name: 'Retail Display Racks', slug: 'retail-display-racks', description: 'Specialized grocery and apparel display units', order: 2 },
      { name: 'Warehouse Racking Systems', slug: 'warehouse-racking', description: 'Heavy-duty structural pallet racks', order: 3 },
      { name: 'Industrial Storage Racks', slug: 'industrial-storage', description: 'Slotted angle and sheet metal cabinets', order: 4 },
      { name: 'Shopping Trolleys', slug: 'shopping-trolleys', description: 'Commercial zinc-plated carts and plastic baskets', order: 5 },
      { name: 'Checkout Counters', slug: 'checkout-counters', description: 'Stainless steel POS cash desks', order: 6 },
    ]);

    // 5. Seed Products
    console.log('[Seed] Seeding verified products...');
    await Product.deleteMany({});
    const productsData = [
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
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
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
    ];

    const seededProducts = await Product.create(productsData);
    console.log(`[Seed] Seeded ${seededProducts.length} verified products.`);

    // 5.5. Seed Product × City Availability Mappings
    console.log('[Seed] Seeding Product × City availability mappings...');
    await ProductCityMapping.deleteMany({});
    const mappingsToSeed = [];
    for (const city of seededCities) {
      for (const prod of seededProducts) {
        mappingsToSeed.push({
          city: city._id,
          product: prod._id,
          isAvailable: true,
          availabilityNotes: `Direct factory dispatch and turnkey assembly in ${city.name}.`,
          createdBy: superAdmin._id,
          updatedBy: superAdmin._id,
        });
      }
    }
    await ProductCityMapping.create(mappingsToSeed);
    console.log(`[Seed] Seeded ${mappingsToSeed.length} ProductCityMapping records.`);

    // 6. Seed Initial High-Demand City + Product Combinations
    console.log('[Seed] Seeding initial high-demand City + Product combinations...');
    await CityProduct.deleteMany({});
    const delhiCity = seededCities.find((c) => c.slug === 'delhi');
    const noidaCity = seededCities.find((c) => c.slug === 'noida');
    const gurugramCity = seededCities.find((c) => c.slug === 'gurugram');

    const gondolaProduct = seededProducts.find((p) => p.slug === 'gondola-display-rack');
    const palletProduct = seededProducts.find((p) => p.slug === 'heavy-duty-warehouse-pallet-rack');
    const trolleyProduct = seededProducts.find((p) => p.slug === 'ergonomic-shopping-trolley');

    const cityProductsToSeed = [
      {
        city: delhiCity._id,
        citySlug: delhiCity.slug,
        cityName: delhiCity.name,
        product: gondolaProduct._id,
        productSlug: gondolaProduct.slug,
        productName: gondolaProduct.name,
        slug: `delhi/${gondolaProduct.slug}`,
        h1Heading: `${gondolaProduct.name} in Delhi`,
        seoTitle: `${gondolaProduct.name} in Delhi | Direct Factory Pricing | RP Storage`,
        metaDescription: `Looking for top-quality ${gondolaProduct.name} in Delhi? RP Storage Solution manufactures heavy-duty gondola and wall display racks with prompt delivery across Delhi NCR.`,
        canonicalUrl: `https://www.rpstoragesolution.com/locations/delhi/${gondolaProduct.slug}/`,
        customContent: `At RP Storage Solution, we specialize in manufacturing premium, high-density modular ${gondolaProduct.name} units for retail stores across Delhi. Whether you operate a grocery store in Mayapuri, a hypermarket in Rohini, or a departmental store in South Delhi, our modular gondolas maximize your aisle visibility and product capacity. Fabricated with certified CRCA steel and electrostatic powder coating, our supermarket display racks provide exceptional longevity and tool-free tier adjustment.`,
        customFaqs: [
          {
            question: 'What is the standard lead time for gondola display racks delivery in Delhi?',
            answer: 'Because our fabrication plant is situated right here in Najafgarh, New Delhi, standard sizes can be delivered within 24 to 48 hours with on-site assembly.',
          },
          {
            question: 'Can you customize the rack color to match our retail brand in Delhi?',
            answer: 'Yes, we provide custom epoxy-polyester powder coating in over 40 architectural shades including classic industrial white, brand orange, graphite charcoal, and ivory.',
          },
        ],
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
      {
        city: noidaCity._id,
        citySlug: noidaCity.slug,
        cityName: noidaCity.name,
        product: palletProduct._id,
        productSlug: palletProduct.slug,
        productName: palletProduct.name,
        slug: `noida/${palletProduct.slug}`,
        h1Heading: `${palletProduct.name} in Noida`,
        seoTitle: `${palletProduct.name} in Noida | High Bay Storage Systems | RP Storage`,
        metaDescription: `High-bay warehouse pallet racking systems in Noida. Up to 3,500 kg per level, custom height uprights & professional on-site installation across Sector 63 & Phase 2.`,
        canonicalUrl: `https://www.rpstoragesolution.com/locations/noida/${palletProduct.slug}/`,
        customContent: `RP Storage Solution supplies high-bay, heavy-duty warehouse pallet racks engineered for logistics distribution centers, ecommerce fulfillment facilities, and cold storage parks across Noida. Fabricated to withstand direct forklift interaction and heavy palletized inventory, our structural uprights and box beams provide safe load capacities up to 3.5 tons per level. We provide free 2D/3D AutoCAD layout schematics for warehouse managers in Noida industrial sectors.`,
        customFaqs: [
          {
            question: 'Do you conduct on-site warehouse spatial measurements in Sector 63, Noida?',
            answer: 'Yes, our structural racking engineers provide on-site measurement surveys and column spacing analysis across Sector 63, Sector 83, and Phase 2 Noida.',
          },
        ],
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
      {
        city: gurugramCity._id,
        citySlug: gurugramCity.slug,
        cityName: gurugramCity.name,
        product: trolleyProduct._id,
        productSlug: trolleyProduct.slug,
        productName: trolleyProduct.name,
        slug: `gurugram/${trolleyProduct.slug}`,
        h1Heading: `${trolleyProduct.name} in Gurugram`,
        seoTitle: `${trolleyProduct.name} in Gurugram | RP Storage Solution`,
        metaDescription: `Aesthetic retail shopping trolleys for stores in Gurugram and IMT Manesar. Direct factory supply & premium finishes.`,
        canonicalUrl: `https://www.rpstoragesolution.com/locations/gurugram/${trolleyProduct.slug}/`,
        customContent: `Designed to elevate modern shopping environments, our retail shopping trolleys cater to premier retail stores, grocery outlets, and hypermarkets across Gurugram. Featuring clean architectural lines, durable electro-zinc chrome finishes, and whisper-quiet polyurethane wheels, our solutions help Gurugram retailers enhance consumer dwell time and operational flow.`,
        customFaqs: [
          {
            question: 'Can you deliver retail displays to mall outlets in Gurugram?',
            answer: 'Yes, we regularly service retail installations across Cyber Hub, Golf Course Road malls, and MG Road retail complexes with after-hours delivery and assembly.',
          },
        ],
        status: 'published',
        publishedAt: new Date(),
        createdBy: superAdmin._id,
        updatedBy: superAdmin._id,
      },
    ];

    await CityProduct.create(cityProductsToSeed);
    console.log('[Seed] City-Product SEO landing pages seeded.');

    // 7. Seed Homepage Content (Areas We Serve enabled)
    await HomepageContent.deleteMany({});
    await HomepageContent.create({
      areasWeServe: {
        isEnabled: true,
        heading: 'Verified Distribution & Service Coverage',
        italicHeading: 'Across Delhi NCR & Regional Logistics Hubs.',
        subtitle: 'Direct factory delivery, spatial surveys, and turnkey on-site assembly across certified regional commercial centers.',
        selectedCities: seededCities.map((c) => c._id),
        displayMode: 'cards',
        ctaText: 'Explore All Service Locations',
      },
      metrics: [
        { value: 35, suffix: '+', label: 'Years of Experience', description: 'Decades of proven manufacturing mastery in high-grade retail and industrial racking.' },
        { value: 100, suffix: '+', label: 'Tons Monthly Capacity', description: 'Modern facility equipped with automated roll-forming and powder-coating systems.' },
        { value: 200, suffix: '+', label: 'Satisfied Enterprises', description: 'Trusted by supermarket chains, logistics parks, and retail brands across India.' },
        { value: 20, suffix: '+', label: 'Engineers & Technicians', description: 'Dedicated in-house design, structural engineering, and installation crew.' },
      ],
    });

    // 8. Seed Site Settings
    await SiteSettings.deleteMany({});
    await SiteSettings.create({
      siteName: 'RP Storage Solution',
      companyName: 'RP Storage Solution',
      contactPhone: '+91-9990023436',
      phoneDisplay: '+91 99900 23436',
      phoneSecondary: '+91-8851254937',
      contactEmail: 'rpstoragesolution12@gmail.com',
      whatsappNumber: '+919990023436',
      address: 'Plot At, Kh No. 13/7, Village Nangali Sakrawati, Najafgarh, New Delhi - 110043, India',
      workingHours: 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
      logoUrl: '/images/logo.png',
      faviconUrl: '/images/logorp.png',
    });

    console.log('\n[Seed Completed] Database is successfully seeded with verified initial production data!');
    console.log('Super Admin Credentials:');
    console.log('Email: admin@rpstorage.com');
    console.log('Password: Admin@RP2026!\n');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();
