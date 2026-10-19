/**
 * Central Factual Data Store for RP Storage Solution
 * Sourced directly and verified from https://www.rpstoragesolution.com/
 */

export const COMPANY_INFO = {
  name: "RP Storage Solution",
  legalName: "RP Storage Solution",
  tagline: "Smart Storage. Exceptional Spaces.",
  subTagline: "Precision engineered retail shelving, warehouse racking systems, and material handling solutions.",
  address: "Plot At, Kh No. 13/7, Village Nangali Sakrawati, Najafgarh, New Delhi - 110043, India",
  phonePrimary: "+91-9990023436",
  phoneDisplay: "+91 99900 23436",
  phoneSecondary: "+91-8851254937",
  email: "rpstoragesolution12@gmail.com",
  whatsappUrl: "https://api.whatsapp.com/send?phone=919990023436&text=Hi%20RP%20Storage%20Solution,%20I%20would%20like%20to%20request%20a%20quote%20for%20storage%20racks.",
  workingHours: "Monday – Saturday: 9:00 AM – 7:00 PM IST",
  googleMapsUrl: "https://maps.google.com/?q=Nangali+Sakrawati+Najafgarh+New+Delhi+110043",
  foundingExperience: "35+",
};

export const TRUST_METRICS = [
  {
    value: 35,
    suffix: "+",
    label: "Years of Experience",
    description: "Decades of proven manufacturing mastery in high-grade retail and industrial racking.",
  },
  {
    value: 100,
    suffix: "+",
    label: "Tons Monthly Capacity",
    description: "Modern facility equipped with automated roll-forming and powder-coating systems.",
  },
  {
    value: 200,
    suffix: "+",
    label: "Satisfied Enterprises",
    description: "Trusted by supermarket chains, logistics parks, and retail brands across India.",
  },
  {
    value: 20,
    suffix: "+",
    label: "Engineers & Technicians",
    description: "Dedicated in-house design, structural engineering, and installation crew.",
  },
];

export const PRODUCT_COLLECTIONS = [
  {
    id: "supermarket-racks",
    number: "01",
    title: "Supermarket Racks",
    subtitle: "Modular wall & center gondola shelving systems",
    description: "Heavy-duty modular supermarket shelving with powder-coated finish, multi-tier adjustability, and front price-tag channels.",
    image: "/images/gondola-rack.jpg",
    features: ["Modular tier adjustment", "High-grade CRCA steel", "Integrated price channel lips"],
    aspectRatio: "aspect-[4/5]",
    tag: "Flagship Retail"
  },
  {
    id: "retail-display-racks",
    number: "02",
    title: "Retail Display Racks",
    subtitle: "Showroom garment displays & wire dump bins",
    description: "Modern retail apparel display racks, wall-mounted hanging rails, and promotional wire mesh dump bins for high sales throughput.",
    image: "/images/display-rack.jpg",
    features: ["Heavy garment hanging capacity", "Perimeter wall rails", "Promotional dump bins"],
    aspectRatio: "aspect-[4/3]",
    tag: "Merchandising"
  },
  {
    id: "warehouse-racking",
    number: "03",
    title: "Warehouse Racking Systems",
    subtitle: "Heavy-duty pallet racking & multi-tier storage",
    description: "Industrial heavy-duty pallet racks with high-tensile structural uprights, safety locking pins, and beam load capacities up to 3,500 kg.",
    image: "/images/heavy-duty-rack.webp",
    features: ["Up to 3,500 kg/level", "High-tensile structural steel", "Seismic safety pin locking"],
    aspectRatio: "aspect-[4/3]",
    tag: "Heavy Industry"
  },
  {
    id: "industrial-storage",
    number: "04",
    title: "Industrial Storage Racks",
    subtitle: "Modular slotted angle shelving & corner storage",
    description: "Heavy-gauge slotted angle racks and modular corner shelving units designed for factory storerooms, spare parts inventory, and archives.",
    image: "/images/slotted-angle-rack.jpg",
    features: ["Corner stiffeners for zero sway", "Oven-baked enamel finish", "Custom tier heights"],
    aspectRatio: "aspect-[4/5]",
    tag: "Logistics"
  },
  {
    id: "shopping-trolleys",
    number: "05",
    title: "Shopping Trolleys & Hand Trucks",
    subtitle: "Platform hand trucks & supermarket trolleys",
    description: "Industrial platform trolleys with non-skid structural deck, folding ergonomic handle, and smooth polyurethane swivel caster wheels.",
    image: "/images/shopping-trolley.jpg",
    features: ["Reinforced platform deck", "Foldable steel handle", "Heavy-load PU swivel castors"],
    aspectRatio: "aspect-[4/3]",
    tag: "Material Handling"
  },
  {
    id: "checkout-counters",
    number: "06",
    title: "Checkout & Cash Counters",
    subtitle: "Stainless steel billing counters with cash drawers",
    description: "Ergonomic supermarket POS cash counters with hairline stainless steel conveyor top, durable red metal body, and integrated locking cash drawer.",
    image: "/images/checkout-counter.jpg",
    features: ["Hairline brushed SS top", "Integrated locking cash drawer", "Concealed wiring ducts"],
    aspectRatio: "aspect-[4/5]",
    tag: "POS Systems"
  },
];

export const FEATURED_PRODUCTS = [
  {
    id: "shopping-trolley",
    slug: "shopping-trolley",
    name: "Shopping Trolley",
    category: "Shopping Trolleys",
    categoryId: "shopping-trolleys",
    image: "/images/shopping-trolley.jpg",
    shortDesc: "Commercial grade supermarket shopping cart with electro-zinc rust proof plating and smooth PU casters.",
    specs: {
      material: "High-Tensile Tubular Steel & Chrome Wire",
      loadCapacity: "80 kg to 160 kg payload",
      finish: "Bright Zinc Plating with Rust-Resistant Clear Coat",
      wheelType: "4x 100mm PU Swivel Castor Wheels",
    },
    highlights: ["Smooth swivel maneuverability", "Red corner buffer protectors", "Heavy-duty wire basket"]
  },
  {
    id: "display-rack",
    slug: "display-rack",
    name: "Display Rack",
    category: "Retail Display Racks",
    categoryId: "retail-display-racks",
    image: "/images/display-rack.jpg",
    shortDesc: "Departmental store grocery & merchandise display racks with wooden accents and multi-tier adjustable shelves.",
    specs: {
      material: "Prime Grade CRCA Steel & Finished Wood Panels",
      loadCapacity: "80 - 140 kg per shelf tier",
      finish: "Pure Polyester Epoxy Powder Coating",
      standardHeight: "1500mm / 1800mm / 2100mm",
    },
    highlights: ["Tool-free tier adjustments", "Dual side product display", "Wooden accent headers"]
  },
  {
    id: "sheet-metal-fabrication",
    slug: "sheet-metal-fabrication",
    name: "Sheet Metal Fabrication",
    category: "Industrial Storage Racks",
    categoryId: "industrial-storage",
    image: "/images/sheet-metal-fabrication.jpg",
    shortDesc: "Custom precision sheet metal brackets, upright channels, and structural components for industrial storage.",
    specs: {
      material: "Heavy Gauge Cold Rolled Steel (IS 2062 / IS 513 CRCA)",
      loadCapacity: "Heavy Structural Load Rating",
      finish: "Hot Dip Galvanized / Powder Coated",
      fabrication: "CNC Turret Punching, Laser Cutting & Hydraulic Bending",
    },
    highlights: ["Custom thickness 1.2mm - 3.5mm", "Precision punch tolerances", "Anti-corrosion galvanization"]
  },
  {
    id: "metal-cabinets",
    slug: "metal-cabinets",
    name: "Metal Cabinets",
    category: "Industrial Storage Racks",
    categoryId: "industrial-storage",
    image: "/images/metal-cabinets.jpg",
    shortDesc: "Heavy-duty industrial steel storage cabinets with 3-point locking system and adjustable internal shelving.",
    specs: {
      material: "Prime Grade 1.2mm CRCA Steel Body",
      loadCapacity: "100 kg per shelf tier",
      finish: "7-Tank Pretreatment Electrostatic Powder Coated",
      lockType: "3-Point Central Cam Lock with Dual Keys",
    },
    highlights: ["Reinforced double doors", "Anti-pry internal hinges", "Oven-baked durable enamel"]
  },
  {
    id: "heavy-duty-rack",
    slug: "heavy-duty-rack",
    name: "Heavy Duty Rack",
    category: "Warehouse Racking Systems",
    categoryId: "warehouse-racking",
    image: "/images/heavy-duty-rack.webp",
    shortDesc: "High-bay industrial warehouse pallet racking with blue structural uprights and orange cross beams.",
    specs: {
      material: "High-Tensile Structural Steel",
      loadCapacity: "1,000 kg – 3,500 kg per beam level",
      finish: "Electrostatic Powder Coated Uprights (Blue) & Beams (Orange)",
      standardHeight: "2,000mm up to 8,000mm",
    },
    highlights: ["Safety locking pins", "Heavy beam connectors", "Seismic floor anchor points"]
  },
  {
    id: "retail-display-rack",
    slug: "retail-display-rack",
    name: "Retail Display Rack",
    category: "Retail Display Racks",
    categoryId: "retail-display-racks",
    image: "/images/retail-display-rack.png",
    shortDesc: "Modern black retail display shelving with overhead canopy LED lighting for supermarket beverage aisles.",
    specs: {
      material: "Heavy-Gauge Cold Rolled Steel (CRCA)",
      loadCapacity: "90 - 150 kg per shelf tier",
      finish: "Matte Black Pure Polyester Powder Coating",
      lighting: "Integrated Warm White LED Canopy Light Strips",
    },
    highlights: ["Overhead illuminated canopy", "High product contrast black finish", "Price ticket channel strips"]
  },
  {
    id: "slotted-angle-rack",
    slug: "slotted-angle-rack",
    name: "Slotted Angle Rack",
    category: "Industrial Storage Racks",
    categoryId: "industrial-storage",
    image: "/images/slotted-angle-rack.jpg",
    shortDesc: "Heavy gauge dark grey slotted angle storage rack with multi-tier corner and wall shelving.",
    specs: {
      material: "Heavy Gauge Slotted Steel Angles & Pressed Shelves",
      loadCapacity: "70 – 120 kg per shelf uniformly distributed",
      finish: "Durable Dark Grey Oven-Baked Enamel Coating",
      standardHeight: "1800mm / 2400mm",
    },
    highlights: ["Corner stiffener plates for zero sway", "Variable shelf pitch", "Easy manual assembly"]
  },
  {
    id: "shopping-basket",
    slug: "shopping-basket",
    name: "Shopping Basket",
    category: "Shopping Trolleys",
    categoryId: "shopping-trolleys",
    image: "/images/shopping-basket.jpg",
    shortDesc: "Ergonomic plastic shopping hand baskets with reinforced red dual carry handles for retail grocery stores.",
    specs: {
      material: "100% Virgin High-Density Polypropylene (HDPE)",
      loadCapacity: "Up to 25 kg payload capacity",
      finish: "High-Gloss Anti-Scratch Finish (Black & Red)",
      capacity: "22 Litres / 28 Litres Volume",
    },
    highlights: ["Dual folding red carry handles", "Ventilated mesh base", "Stackable nesting design"]
  },
  {
    id: "shopping-cart",
    slug: "shopping-cart",
    name: "Shopping Cart",
    category: "Shopping Trolleys",
    categoryId: "shopping-trolleys",
    image: "/images/shopping-cart.jpg",
    shortDesc: "Standard supermarket wire shopping cart with green bumper protectors, ergonomic push handle, and child seat.",
    specs: {
      material: "Bright Zinc Plated Steel Wire with Clear Lacquer Coating",
      loadCapacity: "90 kg - 150 kg payload",
      finish: "Electro-Galvanized Mirror Chrome Finish",
      wheels: "4x 100mm Noise-Free PU Castor Wheels",
    },
    highlights: ["Folding child safety seat", "Green corner bumpers", "Nesting space-saving design"]
  },
  {
    id: "industrial-storage-rack",
    slug: "industrial-storage-rack",
    name: "Industrial Storage Rack",
    category: "Industrial Storage Racks",
    categoryId: "industrial-storage",
    image: "/images/industrial-storage-rack.jpg",
    shortDesc: "Multi-tier medium duty industrial storage rack with blue slotted frame and orange shelf supports.",
    specs: {
      material: "Prime Steel Cold-Formed Upright Sections",
      loadCapacity: "300 kg – 800 kg per storage level",
      finish: "Epoxy Polyester Powder Coating (Blue/Orange)",
      standardHeight: "1800mm / 2400mm / 3000mm",
    },
    highlights: ["Boltless clip-in assembly", "Heavy steel shelf decking", "Custom depth & tier levels"]
  },
  {
    id: "warehouse-rack",
    slug: "warehouse-rack",
    name: "Warehouse Rack",
    category: "Warehouse Racking Systems",
    categoryId: "warehouse-racking",
    image: "/images/warehouse-rack.jpg",
    shortDesc: "Heavy industrial warehouse beam racking with white shelf decking panels and blue structural uprights.",
    specs: {
      material: "High Yield IS 2062 Structural Steel",
      loadCapacity: "800 kg – 2,500 kg per beam tier",
      finish: "Corrosion-Resistant Industrial Powder Coating",
      decking: "Cold Rolled Steel Deck Panels",
    },
    highlights: ["Forklift accessible layout", "Safety beam locks", "Modular extension bays"]
  },
  {
    id: "vegetable-rack-for-shop",
    slug: "vegetable-rack-for-shop",
    name: "Vegetable Rack For Shop",
    category: "Retail Display Racks",
    categoryId: "retail-display-racks",
    image: "/images/vegetable-rack-for-shop.jpg",
    shortDesc: "Multi-tier slanted grocery & produce display rack with wooden front fascia and plastic perforated vegetable crates.",
    specs: {
      material: "Heavy MS Tubular Frame with Wooden Border Accents",
      loadCapacity: "50 kg per crate tier",
      finish: "Anti-Corrosive Green / Black Powder Coating",
      design: "Slanted inclined tiers for maximum product visibility",
    },
    highlights: ["Inclined crate display angles", "Natural wood front border", "Easy-to-clean hygiene design"]
  },
  {
    id: "plastic-shopping-basket",
    slug: "plastic-shopping-basket",
    name: "Plastic Shopping Basket",
    category: "Shopping Trolleys",
    categoryId: "shopping-trolleys",
    image: "/images/plastic-shopping-basket.jpg",
    shortDesc: "Stackable black supermarket shopping hand basket with red dual swing handles and ventilated grid base.",
    specs: {
      material: "Impact-Resistant Virgin Polypropylene (PP)",
      loadCapacity: "25 kg load bearing",
      finish: "Scratch-Resistant Textured Surface",
      volume: "25 Litres Capacity",
    },
    highlights: ["Dual ergonomic grip swing handles", "Stackable nesting design", "Smooth rounded corners"]
  },
  {
    id: "garment-display-rack",
    slug: "garment-display-rack",
    name: "Garment Display Rack",
    category: "Retail Display Racks",
    categoryId: "retail-display-racks",
    image: "/images/garment-display-rack.jpg",
    shortDesc: "Retail apparel and clothing display rack with stepped hanging bars and lower shelving tier for folded garments.",
    specs: {
      material: "Heavy Gauge Steel with Chrome Hanging Tubes",
      loadCapacity: "120 kg total hanging load",
      finish: "Orange Frame with Powder-Coated Shelving & Polished Chrome Rails",
      usage: "Apparel Boutiques, Garment Showrooms, Fashion Retail",
    },
    highlights: ["Multi-level hanging bars", "Integrated shelf for folded stock", "High-visibility retail display"]
  },
  {
    id: "gondola-rack",
    slug: "gondola-rack",
    name: "Gondola Rack",
    category: "Supermarket Racks",
    categoryId: "supermarket-racks",
    image: "/images/gondola-rack.jpg",
    shortDesc: "Two-sided central island supermarket gondola display shelving with purple/red price channel edging.",
    specs: {
      material: "Prime Grade Cold Rolled Steel (CRCA)",
      loadCapacity: "80 - 150 kg per shelf tier",
      finish: "Electrostatic Pure Polyester Epoxy Powder Coating",
      standardHeight: "1500mm / 1800mm / 2100mm",
    },
    highlights: ["Tool-free tier adjustments", "Dual side product display", "Integrated price channel holders"]
  },
  {
    id: "cash-desk-counter",
    slug: "cash-desk-counter",
    name: "Cash Desk Counter",
    category: "Checkout Counters",
    categoryId: "checkout-counters",
    image: "/images/cash-desk-counter.jpg",
    shortDesc: "Commercial POS retail checkout cash desk with stainless steel conveyor top, red steel front, and computer console.",
    specs: {
      material: "Hairline Brushed Stainless Steel Worktop & CRCA Body",
      dimensions: "1800mm x 1000mm x 850mm",
      finish: "Glossy Red & Off-White Powder Coating",
      features: "Keyboard tray, locking cash drawer, and barcode scanner recess",
    },
    highlights: ["Ergonomic cashier legroom", "Heavy steel locking drawer", "Smooth sliding stainless worktop"]
  },
  {
    id: "checkout-counter",
    slug: "checkout-counter",
    name: "Checkout Counter",
    category: "Checkout Counters",
    categoryId: "checkout-counters",
    image: "/images/checkout-counter.jpg",
    shortDesc: "Heavy-duty orange supermarket checkout counter with stainless steel slide top and locking cash drawer cabinet.",
    specs: {
      material: "Hairline Brushed Stainless Steel Top + Heavy MS Base",
      dimensions: "1800mm x 1000mm x 850mm (Customizable)",
      finish: "Safety Orange Oven-Baked Powder Coating",
      cashDrawer: "Multi-compartment note clips, coin slots with key lock",
    },
    highlights: ["Smooth product gliding worktop", "Integrated locking cash drawer", "Concealed wiring ducts"]
  },
  {
    id: "plastic-trolley",
    slug: "plastic-trolley",
    name: "Plastic Trolley",
    category: "Shopping Trolleys",
    categoryId: "shopping-trolleys",
    image: "/images/plastic-trolley.jpg",
    shortDesc: "Modern vertical plastic supermarket basket trolley with yellow rim accent and 4 smooth rolling swivel casters.",
    specs: {
      material: "High-Impact Polypropylene (PP) Basket on Metal Base",
      loadCapacity: "40 kg payload",
      finish: "Dark Grey Body with Bright Yellow Top Rim",
      wheels: "4x 75mm Heavy-Duty Swivel Rubber Casters",
    },
    highlights: ["Deep 65L vertical basket", "Ultra-lightweight steering", "Space-efficient shopping format"]
  },
  {
    id: "supermarket-display-rack",
    slug: "supermarket-display-rack",
    name: "Supermarket Display Rack",
    category: "Supermarket Racks",
    categoryId: "supermarket-racks",
    image: "/images/supermarket-display-rack.jpg",
    shortDesc: "Wall-mounted supermarket retail merchandise shelving unit with red front lips and multi-tier adjustable shelves.",
    specs: {
      material: "Prime CRCA Steel Panel & Slotted Uprights",
      loadCapacity: "80 - 120 kg per tier",
      finish: "Polyester Epoxy Powder Coating with Red Price Channels",
      standardHeight: "1800mm / 2100mm / 2400mm",
    },
    highlights: ["Adjustable shelf levels", "High-density merchandising", "Red price tag channels"]
  },
  {
    id: "grocery-store-rack",
    slug: "grocery-store-rack",
    name: "Grocery Store Rack",
    category: "Supermarket Racks",
    categoryId: "supermarket-racks",
    image: "/images/grocery-store-rack.jpg",
    shortDesc: "Multi-tier curved white supermarket food and grocery store display shelving with high product visibility.",
    specs: {
      material: "High-Grade CRCA Steel with Top Canopy Cover",
      loadCapacity: "100 - 150 kg per shelf level",
      finish: "Pure White Anti-Bacterial Powder Coating",
      shelves: "5 to 6 modular adjustable display shelves",
    },
    highlights: ["Curved modern aesthetic", "Heavy load bearing capacity", "Integrated top lighting canopy"]
  },
  {
    id: "hand-basket",
    slug: "hand-basket",
    name: "Hand Basket",
    category: "Shopping Trolleys",
    categoryId: "shopping-trolleys",
    image: "/images/Hand-Basket.jpg",
    shortDesc: "Durable plastic hand shopping baskets in black and grey with dual ergonomic folding handles.",
    specs: {
      material: "Reinforced Polypropylene (PP)",
      loadCapacity: "22 kg payload capacity",
      finish: "Matte Texture (Black / Grey)",
      capacity: "22 Litres Volume",
    },
    highlights: ["Dual black folding handles", "Perforated easy-to-clean grid base", "Compact nesting stackability"]
  }
];

export const INDUSTRY_SOLUTIONS = [
  {
    id: "retail",
    title: "Supermarkets & Hypermarkets",
    subtitle: "High-Volume Consumer Footfall",
    description: "Comprehensive store fitouts from central gondola runs to produce racks, shopping carts, and high-speed checkout counters.",
    image: "/images/grocery-store-rack.jpg",
    gallery: [
      { url: "/images/grocery-store-rack.jpg", title: "Grocery & Gondola Shelving", tag: "Primary System" },
      { url: "/images/display-rack.jpg", title: "Departmental Store Display", tag: "Accent Shelving" },
      { url: "/images/shopping-trolley.jpg", title: "Commercial Shopping Trolleys", tag: "Store Transit" },
      { url: "/images/checkout-counter.jpg", title: "Heavy-Duty Cash Counters", tag: "Billing Desk" }
    ],
    deliverables: ["Modular Gondolas", "Produce Displays", "Checkout Desks", "Shopping Baskets"],
    specs: [
      { label: "Tier Payload", value: "80 – 140 kg / level" },
      { label: "Finish", value: "Epoxy Powder Coated" },
      { label: "Steel Grade", value: "Prime IS 513 CRCA" }
    ],
    installedStat: "450+ Supermarkets Fitted"
  },
  {
    id: "warehousing",
    title: "Warehouses & Logistics Parks",
    subtitle: "Heavy-Duty Pallet Infrastructure",
    description: "High-bay pallet racks, drive-in systems, and multi-tier mezzanines designed to maximize cubic storage volume.",
    image: "/images/warehouse-rack.jpg",
    gallery: [
      { url: "/images/warehouse-rack.jpg", title: "Heavy Pallet Beam Racks", tag: "Primary System" },
      { url: "/images/heavy-duty-rack.webp", title: "High-Bay Logistics Racking", tag: "High Load" },
      { url: "/images/slotted-angle-rack.jpg", title: "Industrial Slotted Angle Shelving", tag: "Shopfloor" },
      { url: "/images/industrial-storage-rack.jpg", title: "Multi-Tier Storage Infrastructure", tag: "High-Density" }
    ],
    deliverables: ["Heavy Pallet Racking", "Cantilever Racks", "Mezzanine Floors", "Heavy Angles"],
    specs: [
      { label: "Beam Capacity", value: "Up to 3,500 kg / level" },
      { label: "Frame Heights", value: "Up to 8,000 mm" },
      { label: "Safety Standard", value: "Seismic Anchored IS 2062" }
    ],
    installedStat: "1,200+ Warehouses Installed"
  },
  {
    id: "fashion",
    title: "Department Stores & Apparel",
    subtitle: "Curated Visual Merchandising",
    description: "Minimalist garment display units, four-way hangers, perimeter wall fixtures, and display pedestals.",
    image: "/images/garment-display-rack.jpg",
    gallery: [
      { url: "/images/garment-display-rack.jpg", title: "Garment Display Center Unit", tag: "Primary System" },
      { url: "/images/retail-display-rack.png", title: "Apparel Perimeter & Island Rails", tag: "Merchandising" },
      { url: "/images/display-rack.jpg", title: "Multi-Tier Footwear & Accessories", tag: "Shelving" }
    ],
    deliverables: ["Garment Hanging Racks", "Perimeter Wall Rails", "Display Island Racks", "Accessory Stands"],
    specs: [
      { label: "Finish", value: "Matte Black & Chrome" },
      { label: "Layout", value: "Modular Floor & Wall Systems" },
      { label: "Capacity", value: "High-Density Apparel" }
    ],
    installedStat: "600+ Retail Showrooms"
  },
  {
    id: "industrial",
    title: "Manufacturing & Industrial Facilities",
    subtitle: "Shopfloor & Tooling Storage",
    description: "Engineered sheet-metal cabinets, slotted angles, and heavy-payload raw material racks built to withstand rigorous industrial conditions.",
    image: "/images/sheet-metal-fabrication.jpg",
    gallery: [
      { url: "/images/sheet-metal-fabrication.jpg", title: "Precision Sheet Metal Fabrication", tag: "Primary System" },
      { url: "/images/metal-cabinets.jpg", title: "Industrial Steel Tool Cabinets", tag: "Secure Storage" },
      { url: "/images/slotted-angle-rack.jpg", title: "Heavy Slotted Angle Tool Racks", tag: "Shopfloor" }
    ],
    deliverables: ["Metal Tool Cabinets", "Slotted Angle Systems", "Raw Material Racks", "Fabricated Enclosures"],
    specs: [
      { label: "Sheet Gauge", value: "1.2mm – 3.5mm CRCA" },
      { label: "Lock Mechanism", value: "3-Point Central Deadlock" },
      { label: "Surface Prep", value: "7-Tank Pretreatment" }
    ],
    installedStat: "850+ Industrial Facilities"
  }
];


export const WHY_CHOOSE_US = [
  {
    number: "01",
    title: "Tailored Custom Engineering",
    description: "Every warehouse and retail store has unique spatial constraints. We custom-fabricate dimensions, load capacities, and shelf depths to your exact floor plan.",
    icon: "Ruler"
  },
  {
    number: "02",
    title: "Prime Structural Grade Steel",
    description: "We use only certified high-tensile CRCA and HR steel sheets from top Indian mills, ensuring zero sagging under rated heavy payloads.",
    icon: "ShieldCheck"
  },
  {
    number: "03",
    title: "Space Utilization Architecture",
    description: "Our design team provides optimized layout schematics that maximize vertical clearance, expand pallet positions, and improve aisle throughput.",
    icon: "Maximize"
  },
  {
    number: "04",
    title: "8-Stage Chemical Pretreatment",
    description: "All metal components undergo automated de-greasing, phosphating, and electrostatic epoxy-polyester powder coating for superior corrosion resistance.",
    icon: "Sparkles"
  },
  {
    number: "05",
    title: "Direct Factory Pricing",
    description: "Eliminating middlemen and external sub-contractors, we deliver premium industrial-grade racking at highly competitive manufacturer direct rates.",
    icon: "TrendingUp"
  },
  {
    number: "06",
    title: "End-to-End Turnkey Execution",
    description: "From initial on-site spatial survey to manufacturing, prompt dispatch, and certified on-site assembly, our dedicated crew handles every stage.",
    icon: "Truck"
  }
];

export const MANUFACTURING_PROCESS = [
  {
    step: "01",
    title: "Raw Material Selection",
    subtitle: "Certified CRCA & Structural Tubing",
    description: "Every production batch begins with certified high-grade steel sheets and precision structural profiles verified for tensile strength and gauge thickness."
  },
  {
    step: "02",
    title: "CAD Modeling & Load Simulation",
    subtitle: "Finite Element Structural Analysis",
    description: "Our engineering department designs custom CAD layouts and runs load deflection simulations to guarantee structural safety factors."
  },
  {
    step: "03",
    title: "CNC Punching & Roll Forming",
    subtitle: "High-Tolerance Fabrication",
    description: "Automated CNC laser cutters, hydraulic press brakes, and roll forming lines produce uniform keyholes, slots, and beam connectors with sub-millimeter precision."
  },
  {
    step: "04",
    title: "Chemical Pretreatment & Powder Coating",
    subtitle: "8-Tank Automated Surface Line",
    description: "Complete immersion in an 8-tank chemical process removes all oxidation prior to electrostatic powder coating baked at 200°C for lifetime durability."
  },
  {
    step: "05",
    title: "Rigorous Quality Audit & Dispatch",
    subtitle: "Deflection Verification & On-Site Assembly",
    description: "Each production run undergoes load deflection testing and coating thickness checks before packaging and on-time nationwide delivery."
  }
];

export const AUTHENTIC_TESTIMONIALS = [
  {
    id: "test-1",
    author: "Nitin Kumar",
    role: "Retail Chain Director",
    company: "Supermarket Enterprise, Delhi NCR",
    comment: "RP Storage Solution delivered top-quality racks and trolleys. Excellent finish, sturdy design, and timely delivery. Truly professional and reliable service throughout our store rollout.",
    rating: 5,
    verified: true
  },
  {
    id: "test-2",
    author: "Kapil",
    role: "Operations Head",
    company: "Industrial Logistics Hub",
    comment: "We purchased heavy-duty racks and metal cabinets for our facility. Superb quality, perfect on-site installation, and great after-sales support. RP Storage Solution delivers what they promise.",
    rating: 5,
    verified: true
  },
  {
    id: "test-3",
    author: "Vijay",
    role: "Store Manager",
    company: "Departmental Retail Outlet",
    comment: "Our supermarket looks exceptionally premium now! Stylish gondola racks, shopping trolleys, and baskets — all supplied by RP Storage Solution. Excellent craftsmanship and finish.",
    rating: 5,
    verified: true
  }
];

export const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "What types of storage and retail racks does RP Storage Solution manufacture?",
    answer: "We manufacture a comprehensive spectrum of commercial and industrial storage solutions including Supermarket Display Racks, Center & Wall Gondola Units, Heavy-Duty Warehouse Pallet Racks, Slotted Angle Shelving, Garment Showroom Racks, Shopping Trolleys, Shopping Baskets, and Stainless Steel Checkout Counters."
  },
  {
    id: "faq-2",
    question: "Can racks be customized to specific dimensions and weight load requirements?",
    answer: "Yes, 100% of our products can be tailored. We customize height, shelf depth, bay length, number of tiers, and steel gauge thickness to match your exact floor dimensions and load per level (from 80 kg light retail tiers up to 3,500 kg heavy pallet levels)."
  },
  {
    id: "faq-3",
    question: "What is the difference between Gondola Racks and Slotted Angle Racks?",
    answer: "Gondola racks feature an aesthetic modular upright with snap-in brackets, built specifically for retail stores and supermarkets where visual appeal and rapid adjustment are key. Slotted angle racks are bolted or multi-slotted utilitarian systems primarily used for storerooms, spare-parts warehouses, and documentation archives."
  },
  {
    id: "faq-4",
    question: "What surface finish is applied to prevent rust and corrosion?",
    answer: "All our steel components undergo an 8-tank chemical pre-treatment process (degreasing, derusting, phosphating) followed by an electrostatic pure epoxy-polyester powder coating cured at 200°C. This creates a scratch-resistant, rust-proof, and easy-to-clean architectural finish."
  },
  {
    id: "faq-5",
    question: "How do I request an official quote and store layout consultation?",
    answer: "You can submit your requirements via our interactive Request a Quote form on this site, call our direct line at +91 99900 23436, or connect with us on WhatsApp. Our design engineers will review your floor plan dimensions and provide a tailored quotation within 24 hours."
  },
  {
    id: "faq-6",
    question: "What geographic locations do you supply and install across?",
    answer: "Our manufacturing facility is located in Najafgarh, New Delhi. We actively supply and execute on-site installation across Delhi NCR, all states of India, and fulfill international export consignments."
  }
];
