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
    image: "/images/gondola-display-rack-real.jpeg",
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
    image: "/images/garment-display-rack-real.jpeg",
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
    image: "/images/warehouse-pallet-rack-real.jpeg",
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
    image: "/images/slotted-angle-rack-real.png",
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
    image: "/images/platform-trolley-real.png",
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
    image: "/images/checkout-cash-counter-real.png",
    features: ["Hairline brushed SS top", "Integrated locking cash drawer", "Concealed wiring ducts"],
    aspectRatio: "aspect-[4/5]",
    tag: "POS Systems"
  },
];

export const FEATURED_PRODUCTS = [
  {
    id: "prod-1",
    name: "Gondola Display Rack",
    category: "Supermarket Racks",
    categoryId: "supermarket-racks",
    image: "/images/gondola-display-rack-real.jpeg",
    shortDesc: "Modular white supermarket wall & gondola display shelving with red price-channel lips.",
    specs: {
      material: "Prime Grade Cold Rolled Steel (CRCA)",
      loadCapacity: "80 - 150 kg per shelf tier",
      finish: "Electrostatic Pure Polyester Epoxy Powder Coating",
      standardHeight: "1500mm / 1800mm / 2100mm",
      shelfDepth: "300mm to 500mm adjustable",
    },
    highlights: ["Tool-free tier adjustments", "Dual side product display", "Integrated red price channel holders"]
  },
  {
    id: "prod-2",
    name: "Heavy Duty Warehouse Pallet Rack",
    category: "Warehouse Racking",
    categoryId: "warehouse-racking",
    image: "/images/warehouse-pallet-rack-real.jpeg",
    shortDesc: "High-bay industrial warehouse pallet racking with blue structural uprights and orange cross beams.",
    specs: {
      material: "High-Tensile Structural Steel",
      loadCapacity: "1,000 kg – 3,500 kg per beam level",
      finish: "Electrostatic Powder Coated Uprights (Blue) & Beams (Orange)",
      standardHeight: "2,000mm up to 8,000mm",
      beamLengths: "2200mm, 2700mm, 3300mm",
    },
    highlights: ["Safety locking pins", "Heavy beam connectors", "Custom floor anchor points"]
  },
  {
    id: "prod-3",
    name: "Slotted Angle Storage Rack",
    category: "Industrial Storage",
    categoryId: "industrial-storage",
    image: "/images/slotted-angle-rack-real.png",
    shortDesc: "Heavy gauge dark grey slotted angle storage rack with multi-tier corner and wall shelving.",
    specs: {
      material: "Heavy Gauge Slotted Steel Angles & Pressed Shelves",
      loadCapacity: "70 – 120 kg per shelf uniformly distributed",
      finish: "Durable Dark Grey Oven-Baked Enamel Coating",
      standardHeight: "1800mm / 2400mm",
      levels: "4 to 7 adjustable tiers",
    },
    highlights: ["Corner stiffener plates for zero sway", "Variable shelf pitch", "Easy manual assembly"]
  },
  {
    id: "prod-4",
    name: "Supermarket Cash & Checkout Counter",
    category: "Checkout Counters",
    categoryId: "checkout-counters",
    image: "/images/checkout-cash-counter-real.png",
    shortDesc: "Stainless steel worktop POS checkout desk with red steel body and integrated locking cash drawer.",
    specs: {
      material: "Hairline Brushed Stainless Steel Worktop + Heavy Red MS Body",
      dimensions: "1800mm x 1000mm x 850mm (Customizable)",
      finish: "Powder Coated Metal with Brushed Stainless Steel Slide Surface",
      cashDrawer: "Multi-compartment note clips, coin slots with key lock",
      features: "Integrated POS stand cutout, lockable storage drawer",
    },
    highlights: ["Smooth product sliding worktop", "Integrated locking cash drawer", "Concealed wiring ducts"]
  },
  {
    id: "prod-5",
    name: "Heavy Duty Platform Trolley",
    category: "Shopping Trolleys",
    categoryId: "shopping-trolleys",
    image: "/images/platform-trolley-real.png",
    shortDesc: "Industrial flatbed platform hand truck with reinforced blue deck and folding ergonomic handle.",
    specs: {
      material: "Reinforced Structural Polymer Deck & Tubular Steel Handle",
      loadCapacity: "150 kg to 300 kg payload capacity",
      finish: "Anti-skid textured blue platform with corrosion-resistant handle",
      wheelType: "4x Heavy-Duty Swivel Polyurethane Castor Wheels",
      handle: "Foldable ergonomic handle with foot-release mechanism",
    },
    highlights: ["Folding handle for space-saving storage", "Smooth-rolling 360-degree wheels", "Heavy payload stability"]
  },
  {
    id: "prod-6",
    name: "Retail Garment & Apparel Display Rack",
    category: "Retail Display Racks",
    categoryId: "retail-display-racks",
    image: "/images/garment-display-rack-real.jpeg",
    shortDesc: "Showroom garment hanging fixtures and perimeter wall display shelving for apparel stores.",
    specs: {
      material: "Heavy-Gauge Powder Coated MS & Chrome Hanging Rails",
      finish: "Pure White & Chrome Modern Architectural Finish",
      height: "2100mm / 2400mm modular wall fixtures",
      accessories: "Integrated price signage frames, folded garment shelves, hanging rails",
    },
    highlights: ["High-density apparel hanging capacity", "Perimeter wall rail mounting", "Integrated price signage displays"]
  },
  {
    id: "prod-7",
    name: "Square Wire Mesh Promotional Dump Bin",
    category: "Retail Display Racks",
    categoryId: "retail-display-racks",
    image: "/images/square-wire-dump-bin-real.png",
    shortDesc: "Collapsible square chrome wire mesh dump bin with folding stand for retail discount promotions.",
    specs: {
      material: "Heavy-Gauge Electro-Plated Chrome Steel Wire",
      stand: "Folding Tubular Steel Chrome Base Stand",
      meshGrid: "High-strength welded wire grid with reinforced corners",
      capacity: "Up to 60 kg distributed promotional merchandise",
    },
    highlights: ["Collapsible folding stand", "High-visibility impulse display", "Corrosion-resistant bright chrome plating"]
  },
  {
    id: "prod-8",
    name: "Round Wire Display Basket",
    category: "Retail Display Racks",
    categoryId: "retail-display-racks",
    image: "/images/round-wire-basket-real.png",
    shortDesc: "Tapered circular chrome wire mesh impulse display basket on sturdy floor stand.",
    specs: {
      material: "Bright Chrome-Plated Cold Drawn Steel Wire",
      design: "Tapered round circular dump bin basket",
      base: "Integrated circular wire floor support base",
      usage: "Aisle-end and checkout impulse retail merchandising",
    },
    highlights: ["360-degree customer accessibility", "Lightweight yet sturdy steel construction", "Mirror chrome finish"]
  }
];

export const INDUSTRY_SOLUTIONS = [
  {
    id: "retail",
    title: "Supermarkets & Hypermarkets",
    subtitle: "High-Volume Consumer Footfall",
    description: "Comprehensive store fitouts from central gondola runs to produce racks, shopping carts, and high-speed checkout counters.",
    image: "/images/banner1.jpeg",
    deliverables: ["Modular Gondolas", "Produce Displays", "Checkout Desks", "Shopping Baskets"]
  },
  {
    id: "warehousing",
    title: "Warehouses & Logistics Parks",
    subtitle: "Heavy-Duty Pallet Infrastructure",
    description: "High-bay pallet racks, drive-in systems, and multi-tier mezzanines designed to maximize cubic storage volume.",
    image: "/images/banner3.jpeg",
    deliverables: ["Heavy Pallet Racking", "Cantilever Racks", "Mezzanine Floors", "Heavy Angles"]
  },
  {
    id: "fashion",
    title: "Department Stores & Apparel",
    subtitle: "Curated Visual Merchandising",
    description: "Minimalist garment display units, four-way hangers, perimeter wall fixtures, and display pedestals.",
    image: "/images/banner2.jpeg",
    deliverables: ["Garment Hanging Racks", "Perimeter Wall Rails", "Display Island Racks", "Accessory Stands"]
  },
  {
    id: "industrial",
    title: "Manufacturing & Industrial Facilities",
    subtitle: "Shopfloor & Tooling Storage",
    description: "Engineered sheet-metal cabinets, slotted angles, and heavy-payload raw material racks built to withstand rigorous industrial conditions.",
    image: "/images/banner4.jpeg",
    deliverables: ["Metal Tool Cabinets", "Slotted Angle Systems", "Raw Material Racks", "Fabricated Enclosures"]
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
