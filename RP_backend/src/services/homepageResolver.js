import { HomepageContent } from '../models/HomepageContent.js';
import { CityHomepage } from '../models/CityHomepage.js';
import { City } from '../models/City.js';
import { Product } from '../models/Product.js';
import { CityProduct } from '../models/CityProduct.js';
import { ProductCityMapping } from '../models/ProductCityMapping.js';
import { resolveProductUrlsBulk } from './productUrlResolver.js';
import crypto from 'crypto';

/**
 * Validates HMAC signed preview token for CityHomepage drafts
 */
export function verifyCityHomepagePreviewToken(token, recordId) {
  if (!token || !recordId) return false;
  const parts = String(token).split('.');
  if (parts.length !== 2) return false;
  const [expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() >= expiresAt) return false;

  const secret = process.env.JWT_SECRET || 'rp-storage-preview-secret-key-development';
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`city-homepage:${recordId}:${expiresAt}`)
    .digest('hex');
  return signature === expectedSig;
}

/**
 * Generates HMAC signed preview token for CityHomepage drafts
 */
export function generateCityHomepagePreviewToken(recordId, ttlMs = 3600000) {
  const expiresAt = Date.now() + ttlMs;
  const secret = process.env.JWT_SECRET || 'rp-storage-preview-secret-key-development';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`city-homepage:${recordId}:${expiresAt}`)
    .digest('hex');
  return `${expiresAt}.${signature}`;
}

/**
 * Default fallback common content
 */
export const defaultCommonContent = {
  hero: {
    eyebrow: 'Atelier Industrial Racking & Shelving',
    headline: 'Smart Storage.',
    italicHeadline: 'Exceptional Spaces.',
    subtitle:
      'Discover intelligently designed storage, shelving and display systems that bring strength, efficiency and order to modern retail spaces and industrial warehouses.',
    primaryCtaText: 'Request a Quote',
    secondaryCtaText: 'Explore Products',
    image: '/images/banner3.jpeg',
  },
  trustStrip: {
    badges: [
      { icon: 'Award', title: 'ISO 9001:2015', subtitle: 'Certified Manufacturing Facility' },
      { icon: 'ShieldCheck', title: 'IS 2062 Grade Steel', subtitle: 'Heavy Structural Load Certified' },
      { icon: 'Truck', title: 'Direct Factory Supply', subtitle: 'No Intermediaries or Margins' },
      { icon: 'Wrench', title: 'Turnkey Installation', subtitle: 'On-Site Erection & Rigging' },
    ],
  },
  about: {
    eyebrow: 'About RP Storage Solution',
    headline: 'Built with Precision.',
    italicHeadline: 'Designed for Possibilities.',
    paragraph1:
      'At RP Storage Solution, we view our clients as long-term partners, building business relationships founded on structural reliability, precision fabrication, and mutual growth. Based in New Delhi, India, we have established ourselves as one of the country’s most dependable manufacturers and suppliers of retail and industrial storage systems.',
    paragraph2:
      'With over three decades of practical engineering expertise, we understand the distinct spatial demands of modern retail stores, supermarkets, and high-throughput distribution warehouses. Our dedicated design team customizes each racking assembly to maximize vertical footprint and optimize workflow efficiency.',
    image: '/images/4605.jpg',
  },
  industries: {
    heading: 'Engineered for High-Demand Industries',
    subtitle: 'From temperature-controlled cold storages to high-velocity e-commerce fulfillment centers.',
    items: [
      {
        title: 'Warehousing & 3PL Logistics',
        description: 'High-bay pallet racking, multi-tier mezzanines, and drive-in systems maximizing cubic capacity.',
        image: '/images/heavy-duty-rack.webp',
      },
      {
        title: 'Supermarkets & Hypermarkets',
        description: 'Modular display shelving, end-caps, produce bins, and heavy-duty grocery cash wraps.',
        image: '/images/supermarket-rack.webp',
      },
      {
        title: 'Manufacturing & Automotive',
        description: 'Cantilever storage for long stock, heavy die racks, and component bin shelving.',
        image: '/images/mezzanine-floor.webp',
      },
      {
        title: 'Cold Storage & Food Logistics',
        description: 'Rust-resistant galvanised racks engineered for sub-zero temperatures and high-density blast chilling.',
        image: '/images/slotted-angle-rack.webp',
      },
    ],
  },
  statistics: {
    metrics: [
      { value: 35, suffix: '+', label: 'Years of Precision Engineering', description: 'Continuous manufacturing legacy in Delhi NCR' },
      { value: 1500, suffix: '+', label: 'Completed Installations', description: 'Warehouses, retail stores & distribution hubs' },
      { value: 500, suffix: '+', label: 'Corporate Clients', description: 'Serving leading brands across India' },
      { value: 100, suffix: '%', label: 'Factory Direct Quality', description: 'Fabricated with certified Grade A CRCA steel' },
    ],
  },
  benefits: {
    heading: 'Why Leading Enterprises Choose RP Storage Solution',
    subtitle: 'Engineered structural integrity, automated roll-forming, and direct factory pricing without intermediaries.',
    items: [
      {
        title: 'Prime Grade Structural Steel',
        description: 'All uprights and load beams are roll-formed from certified IS:2062 Grade steel with high tensile resistance.',
        icon: 'Shield',
      },
      {
        title: '8-Tank Chemical Pre-Treatment',
        description: 'Multi-stage hot chemical degreasing, phosphating, and pure polyester electrostatic powder coating for rust prevention.',
        icon: 'Sparkles',
      },
      {
        title: 'Custom Load Capacity Engineering',
        description: 'Every installation is FEA simulated to support exact pallet weights ranging from 500 kg to 3,500 kg per level.',
        icon: 'Layers',
      },
      {
        title: 'Turnkey On-Site Assembly',
        description: 'Our certified rigger teams handle precise floor leveling, seismic base anchoring, and load certification on site.',
        icon: 'Wrench',
      },
    ],
  },
  projects: {
    heading: 'Recent Warehouse & Supermarket Installations',
    subtitle: 'Real installations completed on time with zero operational downtime.',
    items: [
      {
        title: 'High-Density 3PL Pallet Racking',
        location: 'Delhi NCR Hub',
        client: 'Logistics Enterprise',
        image: '/images/heavy-duty-rack.webp',
        rackType: 'Heavy Duty Pallet Rack',
      },
      {
        title: 'Flagship Supermarket Display System',
        location: 'Retail Mall Complex',
        client: 'Supermarket Chain',
        image: '/images/supermarket-rack.webp',
        rackType: 'Retail Display Racks',
      },
      {
        title: 'Multi-Tier Mezzanine Storage Floor',
        location: 'Industrial Area',
        client: 'E-commerce Fulfillment',
        image: '/images/mezzanine-floor.webp',
        rackType: 'Industrial Mezzanine Floor',
      },
    ],
  },
  testimonials: {
    heading: 'Trusted by Logistics Leaders & Retailers',
    items: [
      {
        quote: 'RP Storage Solution transformed our 35,000 sq ft facility. The beam deflection tolerances and powder coat finish are exceptional.',
        author: 'Rajiv Sharma',
        company: 'Apex Supply Chain Solutions',
        location: 'Delhi NCR',
        rating: 5,
      },
      {
        quote: 'Delivered 80 bays of supermarket shelving within 4 days. Sturdy construction, effortless assembly, and excellent customer service.',
        author: 'Sunil Mehta',
        company: 'FreshMart Supermarkets',
        location: 'Greater Noida',
        rating: 5,
      },
    ],
  },
  faqs: [
    {
      question: 'What is the standard manufacturing and delivery turnaround for industrial storage racks?',
      answer:
        'Standard pallet racks and supermarket shelving are typically dispatched within 48 to 72 hours from our Najafgarh plant. Custom structural mezzanines and automated drive-in systems take approximately 7–10 working days.',
    },
    {
      question: 'Do you provide free on-site spatial surveys and CAD layout planning?',
      answer:
        'Yes. Our structural engineers conduct comprehensive warehouse floor surveys to measure column grid spacing, floor slab load capacity, forklift turning radius, and optimize cubic storage utilization.',
    },
    {
      question: 'What steel quality and anti-corrosion standards do RP Storage racks follow?',
      answer:
        'All our industrial uprights and beams are fabricated from prime Grade A CRCA / HR steel (IS:2062). We utilize automated roll-forming and 8-tank chemical pre-treatment with 60–80 micron electrostatic powder coating.',
    },
    {
      question: 'Can rack heights and shelf levels be adjusted after installation?',
      answer:
        'Yes. Our uprights feature 50mm / 75mm center-to-center adjustable slot connector pitches with safety lock pins, enabling seamless level repositioning without cutting or welding.',
    },
  ],
  enquiryCta: {
    heading: 'Ready to Optimize Your Storage & Floor Capacity?',
    subtitle: 'Consult directly with our structural racking engineers for free CAD floor planning and factory direct quotation.',
    phone: '+91 99900 23436',
    buttonText: 'Request Factory Quotation',
  },
  areasWeServe: {
    isEnabled: true,
    heading: 'Verified Distribution & Service Coverage',
    italicHeading: 'Across Delhi NCR & Key Industrial Corridors.',
    subtitle: 'Direct factory delivery, technical spatial surveys, and turnkey on-site assembly across certified regional commercial centers.',
  },
  seo: {
    title: 'RP Storage Solution | Premier Supermarket Racks & Industrial Storage Systems',
    description:
      'RP Storage Solution is India’s premier manufacturer and exporter of heavy-duty supermarket racks, retail display systems, warehouse storage shelving, shopping trolleys, and cash counters.',
    canonicalUrl: 'https://www.rpstoragesolution.com/',
    robotsDirective: 'index, follow',
  },
};

/**
 * Resolves full homepage content for Main Homepage OR City Homepage with inheritance & selective overrides
 */
export async function resolveHomepageContent({
  citySlug = null,
  isPreview = false,
  previewToken = null,
} = {}) {
  // 1. Fetch common HomepageContent or use safe defaults
  const dbCommon = await HomepageContent.findOne().lean();
  const common = {
    hero: { ...defaultCommonContent.hero, ...(dbCommon?.hero || {}) },
    trustStrip: { ...defaultCommonContent.trustStrip, ...(dbCommon?.trustStrip || {}) },
    about: { ...defaultCommonContent.about, ...(dbCommon?.about || {}) },
    industries: { ...defaultCommonContent.industries, ...(dbCommon?.industries || {}) },
    statistics: {
      metrics: (dbCommon?.metrics && dbCommon.metrics.length > 0)
        ? dbCommon.metrics
        : defaultCommonContent.statistics.metrics,
    },
    benefits: { ...defaultCommonContent.benefits, ...(dbCommon?.benefits || {}) },
    projects: { ...defaultCommonContent.projects, ...(dbCommon?.projects || {}) },
    testimonials: { ...defaultCommonContent.testimonials, ...(dbCommon?.testimonials || {}) },
    faqs: (dbCommon?.faqs && dbCommon.faqs.length > 0) ? dbCommon.faqs : defaultCommonContent.faqs,
    enquiryCta: { ...defaultCommonContent.enquiryCta, ...(dbCommon?.enquiryCta || {}) },
    areasWeServe: { ...defaultCommonContent.areasWeServe, ...(dbCommon?.areasWeServe || {}) },
    seo: { ...defaultCommonContent.seo, ...(dbCommon?.seo || {}) },
  };

  // =========================================================================
  // CASE A: Main Homepage (No citySlug)
  // =========================================================================
  if (!citySlug) {
    const products = await Product.find({ status: 'published', isActive: true })
      .select('name slug category categoryTitle shortDesc images specs material')
      .lean();

    const resolvedProducts = await resolveProductUrlsBulk(products, null);

    return {
      success: true,
      isCityHomepage: false,
      city: null,
      sections: {
        hero: { enabled: true, ...common.hero },
        trustStrip: { enabled: true, ...common.trustStrip },
        about: { enabled: true, ...common.about },
        featuredProducts: {
          enabled: true,
          heading: 'Our Storage & Shelving Solutions',
          subtitle: 'Engineered for maximum structural stability, aesthetic retail merchandising, and seamless space utilization.',
          products: resolvedProducts,
        },
        industries: { enabled: true, ...common.industries },
        statistics: { enabled: true, ...common.statistics },
        benefits: { enabled: true, ...common.benefits },
        projects: { enabled: true, ...common.projects },
        testimonials: { enabled: true, ...common.testimonials },
        faqs: { enabled: true, items: common.faqs },
        enquiryCta: { enabled: true, ...common.enquiryCta },
        areasWeServe: { enabled: true, ...common.areasWeServe },
      },
      seo: {
        title: common.seo.title,
        description: common.seo.description,
        canonicalUrl: common.seo.canonicalUrl || 'https://www.rpstoragesolution.com/',
        robotsDirective: 'index, follow',
      },
    };
  }

  // =========================================================================
  // CASE B: City Homepage (/locations/:citySlug)
  // =========================================================================
  const cleanSlug = String(citySlug).toLowerCase().trim();

  // 1. Verify parent City exists
  const cityQuery = { slug: cleanSlug };
  if (!isPreview) {
    cityQuery.status = 'published';
    cityQuery.isVerified = true;
  }
  const city = await City.findOne(cityQuery).lean();

  if (!city) {
    return {
      success: false,
      notFound: true,
      statusCode: 404,
      message: `No published delivery or service location found for '${cleanSlug}'.`,
    };
  }

  // Guardrail: In non-preview mode, city must be verified
  if (!isPreview && !city.isVerified) {
    return {
      success: false,
      notFound: true,
      statusCode: 404,
      message: `City location '${cleanSlug}' is currently unverified.`,
    };
  }

  // 2. Fetch CityHomepage configuration (if any)
  let cityHomepage = null;
  if (isPreview) {
    cityHomepage = await CityHomepage.findOne({ city: city._id }).lean();
    if (cityHomepage) {
      const isValidToken = verifyCityHomepagePreviewToken(previewToken, cityHomepage._id);
      if (!isValidToken) {
        return {
          success: false,
          notFound: true,
          statusCode: 403,
          message: 'Invalid, missing, or expired city homepage preview authorization token.',
        };
      }
    }
  } else {
    cityHomepage = await CityHomepage.findOne({ city: city._id, status: 'published' }).lean();
  }

  // 3. Fetch active ProductCityMappings for this city (Strict Availability Matrix)
  const mappings = await ProductCityMapping.find({
    city: city._id,
    isAvailable: true,
  }).lean();

  const availableProductIds = mappings.map((m) => m.product);

  // 4. Fetch available mapped Products
  let products = [];
  if (availableProductIds.length > 0) {
    products = await Product.find({
      _id: { $in: availableProductIds },
      status: 'published',
      isActive: true,
    })
      .select('name slug category categoryTitle shortDesc images specs material')
      .lean();
  }

  // 5. Centralized Context-Aware URL Resolution for mapped products (single batch query, avoiding N+1)
  const [cityProducts, resolvedProducts] = await Promise.all([
    CityProduct.find({ city: city._id, status: 'published' })
      .select('slug product productName h1Heading seoTitle')
      .lean(),
    resolveProductUrlsBulk(products, city),
  ]);

  // Filter products if cityHomepage configured 'curated' mode
  let finalProducts = resolvedProducts;
  if (cityHomepage?.featuredProducts?.mode === 'OVERRIDE' && cityHomepage.featuredProducts.filterMode === 'curated') {
    const selectedIds = (cityHomepage.featuredProducts.selectedProductIds || []).map((id) => id.toString());
    if (selectedIds.length > 0) {
      finalProducts = resolvedProducts.filter((p) => selectedIds.includes(p._id.toString()));
    }
  }

  // Fetch nearby verified cities for contextual navigation
  const nearbyCities = await City.find({
    state: city.state,
    slug: { $ne: city.slug },
    status: 'published',
    isVerified: true,
  })
    .select('name slug state')
    .limit(6)
    .lean();

  // =========================================================================
  // SECTION-BY-SECTION INHERITANCE ENGINE
  // Modes: INHERIT (default) | OVERRIDE | HIDE | APPEND / REPLACE (for faqs)
  // =========================================================================

  // Hero Section
  const heroMode = cityHomepage?.hero?.mode || 'INHERIT';
  const heroEnabled = heroMode !== 'HIDE';
  const resolvedHero = {
    enabled: heroEnabled,
    eyebrow: (heroMode === 'OVERRIDE' && cityHomepage.hero.eyebrow)
      ? cityHomepage.hero.eyebrow
      : `Verified Service Corridor: ${city.name}, ${city.state}`,
    headline: (heroMode === 'OVERRIDE' && cityHomepage.hero.headline)
      ? cityHomepage.hero.headline.trim()
      : (city.h1Heading ? city.h1Heading.trim() : common.hero.headline),
    italicHeadline: (heroMode === 'OVERRIDE' && cityHomepage.hero.italicHeadline !== undefined)
      ? cityHomepage.hero.italicHeadline
      : ((new RegExp(`\\b${city.name}\\b`, 'i').test(city.h1Heading || common.hero.headline)) ? '' : `in ${city.name}`),
    subtitle: (heroMode === 'OVERRIDE' && cityHomepage.hero.subtitle)
      ? cityHomepage.hero.subtitle
      : (city.introContent || city.description || `Direct factory manufacturing and structural supply of heavy-duty pallet racks, industrial mezzanine floors, and modern supermarket retail display racks for industrial zones across ${city.name}.`),
    primaryCtaText: (heroMode === 'OVERRIDE' && cityHomepage.hero.primaryCtaText)
      ? cityHomepage.hero.primaryCtaText
      : `Request ${city.name} Site Survey`,
    secondaryCtaText: (heroMode === 'OVERRIDE' && cityHomepage.hero.secondaryCtaText)
      ? cityHomepage.hero.secondaryCtaText
      : 'Explore Products',
    image: (heroMode === 'OVERRIDE' && cityHomepage.hero.image)
      ? cityHomepage.hero.image
      : (city.featuredImage || common.hero.image),
  };

  // Trust Strip Section
  const trustStripMode = cityHomepage?.trustStrip?.mode || 'INHERIT';
  const trustStripEnabled = trustStripMode !== 'HIDE';
  const resolvedTrustStrip = {
    enabled: trustStripEnabled,
    badges: (trustStripMode === 'OVERRIDE' && cityHomepage.trustStrip.customBadges?.length > 0)
      ? cityHomepage.trustStrip.customBadges
      : common.trustStrip.badges,
  };

  // About Section
  const aboutMode = cityHomepage?.about?.mode || 'INHERIT';
  const aboutEnabled = aboutMode !== 'HIDE';
  const resolvedAbout = {
    enabled: aboutEnabled,
    eyebrow: (aboutMode === 'OVERRIDE' && cityHomepage.about.eyebrow)
      ? cityHomepage.about.eyebrow
      : `Serving ${city.name} Industrial Corridors`,
    headline: (aboutMode === 'OVERRIDE' && cityHomepage.about.headline)
      ? cityHomepage.about.headline
      : common.about.headline,
    italicHeadline: (aboutMode === 'OVERRIDE' && cityHomepage.about.italicHeadline)
      ? cityHomepage.about.italicHeadline
      : `Engineered for ${city.name}.`,
    paragraph1: (aboutMode === 'OVERRIDE' && cityHomepage.about.paragraph1)
      ? cityHomepage.about.paragraph1
      : (city.description || common.about.paragraph1),
    paragraph2: (aboutMode === 'OVERRIDE' && cityHomepage.about.paragraph2)
      ? cityHomepage.about.paragraph2
      : (city.localRelevance
          ? `Local Industrial Relevance: ${city.localRelevance}. ${common.about.paragraph2}`
          : common.about.paragraph2),
    localPresenceDetails: (aboutMode === 'OVERRIDE' && cityHomepage.about.localPresenceDetails)
      ? cityHomepage.about.localPresenceDetails
      : (city.verificationNotes || city.serviceDetails || `Direct plant supply from Najafgarh via dedicated transit to ${city.name}. Turnkey site surveys and installation.`),
    image: (aboutMode === 'OVERRIDE' && cityHomepage.about.image)
      ? cityHomepage.about.image
      : common.about.image,
  };

  // Featured Products Section
  const featMode = cityHomepage?.featuredProducts?.mode || 'INHERIT';
  const featEnabled = featMode !== 'HIDE';
  const resolvedFeaturedProducts = {
    enabled: featEnabled,
    heading: (featMode === 'OVERRIDE' && cityHomepage.featuredProducts.heading)
      ? cityHomepage.featuredProducts.heading
      : `Engineered Storage Systems Available in ${city.name}`,
    subtitle: (featMode === 'OVERRIDE' && cityHomepage.featuredProducts.subtitle)
      ? cityHomepage.featuredProducts.subtitle
      : `Certified storage systems dispatched to ${city.name} on direct factory terms with load-capacity certifications.`,
    products: finalProducts,
  };

  // Industries Section
  const indMode = cityHomepage?.industries?.mode || 'INHERIT';
  const indEnabled = indMode !== 'HIDE';
  const resolvedIndustries = {
    enabled: indEnabled,
    heading: (indMode === 'OVERRIDE' && cityHomepage.industries.heading)
      ? cityHomepage.industries.heading
      : `Industries Served in ${city.name}`,
    subtitle: (indMode === 'OVERRIDE' && cityHomepage.industries.subtitle)
      ? cityHomepage.industries.subtitle
      : `Custom-engineered storage racking tailored for manufacturing, e-commerce, and retail hubs across ${city.name}.`,
    items: common.industries.items,
    localCaseNote: (indMode === 'OVERRIDE' && cityHomepage.industries.localCaseNote)
      ? cityHomepage.industries.localCaseNote
      : (city.localRelevance || ''),
  };

  // Statistics Section
  const statMode = cityHomepage?.statistics?.mode || 'INHERIT';
  const statEnabled = statMode !== 'HIDE';
  const resolvedStatistics = {
    enabled: statEnabled,
    metrics: (statMode === 'OVERRIDE' && cityHomepage.statistics.metrics?.length > 0)
      ? cityHomepage.statistics.metrics
      : common.statistics.metrics,
  };

  // Benefits (Why Choose Us) Section
  const benMode = cityHomepage?.benefits?.mode || 'INHERIT';
  const benEnabled = benMode !== 'HIDE';
  const resolvedBenefits = {
    enabled: benEnabled,
    heading: (benMode === 'OVERRIDE' && cityHomepage.benefits.heading)
      ? cityHomepage.benefits.heading
      : `Why Choose RP Storage Solution in ${city.name}`,
    subtitle: (benMode === 'OVERRIDE' && cityHomepage.benefits.subtitle)
      ? cityHomepage.benefits.subtitle
      : `Certified structural engineering, automated roll-forming, and rapid on-site erection across ${city.name}.`,
    items: (benMode === 'OVERRIDE' && cityHomepage.benefits.customItems?.length > 0)
      ? cityHomepage.benefits.customItems
      : common.benefits.items,
  };

  // Projects Section
  const projMode = cityHomepage?.projects?.mode || 'INHERIT';
  const projEnabled = projMode !== 'HIDE';
  const resolvedProjects = {
    enabled: projEnabled,
    heading: (projMode === 'OVERRIDE' && cityHomepage.projects.heading)
      ? cityHomepage.projects.heading
      : `Installations & Projects Near ${city.name}`,
    subtitle: (projMode === 'OVERRIDE' && cityHomepage.projects.subtitle)
      ? cityHomepage.projects.subtitle
      : `Completed structural storage installations across ${city.name} and the ${city.state} corridor.`,
    items: (projMode === 'OVERRIDE' && cityHomepage.projects.localProjects?.length > 0)
      ? cityHomepage.projects.localProjects
      : common.projects.items,
  };

  // Testimonials Section
  const testMode = cityHomepage?.testimonials?.mode || 'INHERIT';
  const testEnabled = testMode !== 'HIDE';
  const resolvedTestimonials = {
    enabled: testEnabled,
    items: (testMode === 'OVERRIDE' && cityHomepage.testimonials.customItems?.length > 0)
      ? cityHomepage.testimonials.customItems
      : common.testimonials.items,
  };

  // FAQ Section (Supports INHERIT | APPEND | REPLACE | HIDE)
  const faqMode = cityHomepage?.faqs?.mode || 'INHERIT';
  const faqEnabled = faqMode !== 'HIDE';
  let resolvedFaqs = [];

  const cityFaqs = (cityHomepage?.faqs?.items?.length > 0)
    ? cityHomepage.faqs.items
    : (city.faqs && city.faqs.length > 0)
      ? city.faqs.map((f) => ({ question: f.question, answer: f.answer }))
      : [];

  if (faqMode === 'REPLACE' && cityFaqs.length > 0) {
    resolvedFaqs = cityFaqs;
  } else if (faqMode === 'APPEND' && cityFaqs.length > 0) {
    resolvedFaqs = [...cityFaqs, ...common.faqs];
  } else {
    // INHERIT: prioritize city-specific FAQs if present, else contextualize common FAQs
    if (cityFaqs.length > 0) {
      resolvedFaqs = cityFaqs;
    } else {
      resolvedFaqs = common.faqs.map((f) => ({
        question: f.question.replace(/in Delhi NCR|in India/g, `in ${city.name}`),
        answer: f.answer.replace(/Delhi NCR/g, city.name),
      }));
    }
  }

  // Enquiry CTA Section
  const ctaMode = cityHomepage?.enquiryCta?.mode || 'INHERIT';
  const ctaEnabled = ctaMode !== 'HIDE';
  const resolvedEnquiryCta = {
    enabled: ctaEnabled,
    heading: (ctaMode === 'OVERRIDE' && cityHomepage.enquiryCta.heading)
      ? cityHomepage.enquiryCta.heading
      : `Request Structural CAD Layout & Quotation in ${city.name}`,
    subtitle: (ctaMode === 'OVERRIDE' && cityHomepage.enquiryCta.subtitle)
      ? cityHomepage.enquiryCta.subtitle
      : `Direct plant survey and free load capacity calculations across ${city.name}. Direct line: +91 99900 23436.`,
    phone: (ctaMode === 'OVERRIDE' && cityHomepage.enquiryCta.phone)
      ? cityHomepage.enquiryCta.phone
      : common.enquiryCta.phone,
    buttonText: (ctaMode === 'OVERRIDE' && cityHomepage.enquiryCta.buttonText)
      ? cityHomepage.enquiryCta.buttonText
      : `Request ${city.name} Estimate`,
  };

  // Areas We Serve (Nearby Verified Delivery Hubs)
  const resolvedAreasWeServe = {
    enabled: true,
    heading: `Verified Delivery Corridors Around ${city.name}`,
    italicHeading: `Across ${city.state} & Delhi NCR.`,
    subtitle: `Explore other regional delivery hubs and verified distribution centers served by our Najafgarh facility.`,
    nearbyCities,
  };

  // SEO Metadata
  const resolvedSeo = {
    title: cityHomepage?.seo?.title || city.seoTitle || `Warehouse Racks & Industrial Storage Solutions in ${city.name} | RP Storage`,
    description: cityHomepage?.seo?.description || city.metaDescription || `Leading manufacturer of industrial warehouse racks, pallet racking systems, and supermarket display shelves in ${city.name}. Factory direct supply from Najafgarh plant.`,
    h1: cityHomepage?.seo?.h1 || city.h1Heading || `Heavy Duty Warehouse Racks & Storage Systems in ${city.name}`,
    canonicalUrl: cityHomepage?.seo?.canonicalUrl || city.canonicalUrl || `https://www.rpstoragesolution.com/locations/${city.slug}`,
    robotsDirective: isPreview ? 'noindex, nofollow' : (cityHomepage?.seo?.robotsDirective || 'index, follow'),
    ogTitle: cityHomepage?.seo?.ogTitle || cityHomepage?.seo?.title || city.seoTitle,
    ogDescription: cityHomepage?.seo?.ogDescription || cityHomepage?.seo?.description || city.metaDescription,
    ogImage: cityHomepage?.seo?.ogImage || city.featuredImage || common.hero.image,
  };

  return {
    success: true,
    isCityHomepage: true,
    isPreview,
    city: {
      _id: city._id,
      name: city.name,
      slug: city.slug,
      state: city.state,
      isVerified: city.isVerified,
      serviceAvailability: city.serviceAvailability,
      verificationNotes: city.verificationNotes,
      featuredImage: city.featuredImage,
      localRelevance: city.localRelevance,
    },
    cityHomepageId: cityHomepage?._id || null,
    cityHomepageStatus: cityHomepage?.status || 'unconfigured',
    cityHomepageVersion: cityHomepage?.version || 1,
    cityProducts,
    nearbyCities,
    sections: {
      hero: resolvedHero,
      trustStrip: resolvedTrustStrip,
      about: resolvedAbout,
      featuredProducts: resolvedFeaturedProducts,
      industries: resolvedIndustries,
      statistics: resolvedStatistics,
      benefits: resolvedBenefits,
      projects: resolvedProjects,
      testimonials: resolvedTestimonials,
      faqs: { enabled: faqEnabled, items: resolvedFaqs },
      enquiryCta: resolvedEnquiryCta,
      areasWeServe: resolvedAreasWeServe,
    },
    seo: resolvedSeo,
  };
}
