import crypto from 'crypto';
import mongoose from 'mongoose';
import { City } from '../models/City.js';
import { Product } from '../models/Product.js';
import { CityProduct } from '../models/CityProduct.js';
import { ProductCityMapping } from '../models/ProductCityMapping.js';
import { HomepageContent } from '../models/HomepageContent.js';
import { Enquiry } from '../models/Enquiry.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { logAudit } from '../utils/audit.js';
import { resolveHomepageContent } from '../services/homepageResolver.js';

// GET /api/public/homepage
export const getPublicHomepage = async (req, res) => {
  try {
    const [resolved, homepage, verifiedCities, featuredProducts, siteSettings] = await Promise.all([
      resolveHomepageContent(),
      HomepageContent.findOne().lean(),
      City.find({ isVerified: true, status: 'published' })
        .select('name slug state featuredImage description localRelevance')
        .sort({ name: 1 })
        .lean(),
      Product.find({ isFeatured: true, status: 'published', isActive: true }).lean(),
      SiteSettings.findOne().lean(),
    ]);

    return res.status(200).json({
      success: true,
      isCityHomepage: false,
      city: null,
      sections: resolved.sections,
      seo: resolved.seo,
      data: {
        homepage: homepage || {},
        verifiedCities,
        featuredProducts,
        siteSettings: siteSettings || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/public/locations (Index of all verified published cities)
export const getPublicLocations = async (req, res) => {
  try {
    const cities = await City.find({ status: 'published', isVerified: true })
      .select('name slug state description localRelevance featuredImage imageAlt')
      .sort({ state: 1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      cities,
      total: cities.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/public/locations/:citySlug
export const getPublicCityLanding = async (req, res) => {
  try {
    const { citySlug } = req.params;
    const isPreview = req.query.preview === 'true';
    const previewToken = req.query.token;

    const resolved = await resolveHomepageContent({
      citySlug,
      isPreview,
      previewToken,
    });

    if (!resolved || resolved.notFound) {
      return res.status(resolved?.statusCode || 404).json({
        success: false,
        message: resolved?.message || `No published delivery or service location found for '${citySlug}'.`,
      });
    }

    return res.status(200).json({
      success: true,
      city: resolved.city,
      products: resolved.sections?.featuredProducts?.products || [],
      cityProducts: resolved.cityProducts || [],
      nearbyCities: resolved.nearbyCities || [],
      sections: resolved.sections,
      seo: resolved.seo,
      isCityHomepage: true,
      cityHomepageStatus: resolved.cityHomepageStatus,
      cityHomepageVersion: resolved.cityHomepageVersion,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/public/locations/:citySlug/:productSlug
export const getPublicCityProductLanding = async (req, res) => {
  try {
    const { citySlug, productSlug } = req.params;
    const combinedSlug = `${citySlug.toLowerCase().trim()}/${productSlug.toLowerCase().trim()}`;

    // Check for Secure Draft Preview Token
    const secret = process.env.JWT_SECRET || 'rp-storage-preview-secret-key-development';
    let isAuthorizedPreview = false;

    if (req.query.preview === 'true' && req.query.token) {
      const parts = String(req.query.token).split('.');
      if (parts.length === 2) {
        const [expiresAt, signature] = parts;
        if (Date.now() < parseInt(expiresAt, 10)) {
          const candidate = await CityProduct.findOne({ slug: combinedSlug }).select('_id');
          if (candidate) {
            const expectedSig = crypto
              .createHmac('sha256', secret)
              .update(`${candidate._id}:${expiresAt}`)
              .digest('hex');
            if (signature === expectedSig) {
              isAuthorizedPreview = true;
            }
          }
        }
      }
    }

    const query = { slug: combinedSlug };
    if (!isAuthorizedPreview) {
      query.status = 'published';
    }

    const cityProduct = await CityProduct.findOne(query)
      .populate('city')
      .populate('product')
      .lean();

    if (!cityProduct) {
      return res.status(404).json({
        success: false,
        message: `No published page found for location '${citySlug}' with product '${productSlug}'.`,
      });
    }

    let mapping = null;

    // Direct URL Protection Guards (only enforced for live public traffic, not authorized admin previews)
    if (!isAuthorizedPreview) {
      // Rule 1: Parent City must be published & verified
      if (!cityProduct.city || cityProduct.city.status !== 'published' || !cityProduct.city.isVerified) {
        return res.status(404).json({
          success: false,
          message: `Delivery service to '${citySlug}' is currently unverified or unavailable.`,
        });
      }

      // Rule 2: Parent Product must be published & active
      if (!cityProduct.product || cityProduct.product.status !== 'published' || !cityProduct.product.isActive) {
        return res.status(404).json({
          success: false,
          message: `Product '${productSlug}' is currently not in active production.`,
        });
      }

      // Rule 3: Product-City mapping must be enabled
      mapping = await ProductCityMapping.findOne({
        product: cityProduct.product._id,
        city: cityProduct.city._id,
        isAvailable: true,
      }).lean();

      if (!mapping) {
        return res.status(404).json({
          success: false,
          message: `Product '${cityProduct.product.name}' is currently not available for delivery in '${cityProduct.city.name}'.`,
        });
      }
    }

    // Set noindex header if this is an authorized preview or if robotsDirective requests noindex
    if (isAuthorizedPreview || cityProduct.robotsDirective?.includes('noindex')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    // Related products in this city
    const otherCityProducts = await CityProduct.find({
      city: cityProduct.city._id,
      _id: { $ne: cityProduct._id },
      status: 'published',
    })
      .select('slug productName h1Heading')
      .limit(6)
      .lean();

    return res.status(200).json({
      success: true,
      cityProduct,
      mapping,
      otherCityProducts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/public/products
export const getPublicProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'published', isActive: true };
    if (category) query.category = category;

    const products = await Product.find(query).sort({ isFeatured: -1, createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/public/products/:slug
export const getPublicProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug.toLowerCase().trim(),
      status: 'published',
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not published.' });
    }

    // Related products in the same category
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'published',
      isActive: true,
    })
      .limit(4)
      .lean();

    return res.status(200).json({
      success: true,
      product,
      related,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/public/enquiries (Lead Capture)
export const submitPublicEnquiry = async (req, res) => {
  try {
    const {
      name,
      phone,
      email = '',
      company = '',
      city = '',
      productOfInterest = '',
      productId = null,
      cityId = null,
      storeArea = '',
      timeline = '',
      message = '',
      sourcePageUrl = '/',
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required.',
      });
    }

    // Validate phone pattern
    if (!/^[0-9+-\s]{8,15}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number.',
      });
    }

    // Validate ObjectIds if provided
    let validProductId = null;
    let validCityId = null;
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      validProductId = productId;
    }
    if (cityId && mongoose.Types.ObjectId.isValid(cityId)) {
      validCityId = cityId;
    }

    const enquiry = await Enquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: company.trim(),
      city: city.trim(),
      productOfInterest: productOfInterest.trim() || 'Supermarket Racks',
      productId: validProductId,
      cityId: validCityId,
      storeArea: storeArea.trim(),
      timeline: timeline.trim(),
      requirementDetails: message.trim(),
      sourcePageUrl,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    });

    await logAudit({
      req,
      action: 'NEW_ENQUIRY_SUBMITTED',
      entityType: 'Enquiry',
      entityId: enquiry._id,
      details: `Lead from ${enquiry.name} (${enquiry.phone}) for '${enquiry.productOfInterest}' in '${enquiry.city}'`,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your quotation enquiry has been submitted. Our sales engineers will call you within 24 business hours.',
      enquiryId: enquiry._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
