import crypto from 'crypto';
import { CityProduct } from '../models/CityProduct.js';
import { City } from '../models/City.js';
import { Product } from '../models/Product.js';
import { ProductCityMapping } from '../models/ProductCityMapping.js';
import { PageRevision } from '../models/PageRevision.js';
import { logAudit } from '../utils/audit.js';
import { purgeSeoCache } from '../services/seoRenderer.js';
import { sanitizeHtmlContent, sanitizePlainText } from '../utils/sanitize.js';
import { evaluateSeoQuality } from '../utils/seoQuality.js';

// Helper to save a revision snapshot
const recordRevisionSnapshot = async ({ page, user, action, changeSummary }) => {
  try {
    const revisionCount = await PageRevision.countDocuments({ pageId: page._id });
    const versionNumber = action === 'CREATE_DRAFT' ? 1 : Math.max(revisionCount + 1, (page.version || 1) + 1);

    const snapshotData = page.toObject ? page.toObject() : { ...page };
    delete snapshotData.__v;

    await PageRevision.create({
      pageId: page._id,
      version: versionNumber,
      snapshot: snapshotData,
      author: user?._id,
      authorName: user?.name || 'Administrator',
      authorEmail: user?.email || '',
      changeSummary: changeSummary || `Action: ${action}`,
      workflowAction: action,
    });

    page.version = versionNumber;
    await CityProduct.updateOne({ _id: page._id }, { version: versionNumber });
    return versionNumber;
  } catch (err) {
    console.error('[PageRevision] Failed to create snapshot:', err.message);
  }
};

// GET all City-Product SEO landing pages with rich filtering
export const getCityProducts = async (req, res) => {
  try {
    const {
      search,
      cityId,
      productId,
      status,
      missingMetadata,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { cityName: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { h1Heading: { $regex: search, $options: 'i' } },
        { seoTitle: { $regex: search, $options: 'i' } },
      ];
    }

    if (cityId) query.city = cityId;
    if (productId) query.product = productId;
    if (status && status !== 'all') query.status = status;

    // Filter by missing SEO metadata
    if (missingMetadata) {
      if (missingMetadata === 'missing_title') {
        query.$or = [{ seoTitle: { $exists: false } }, { seoTitle: '' }];
      } else if (missingMetadata === 'missing_desc') {
        query.$or = [{ metaDescription: { $exists: false } }, { metaDescription: '' }];
      } else if (missingMetadata === 'missing_canonical') {
        query.$or = [{ canonicalUrl: { $exists: false } }, { canonicalUrl: '' }];
      } else if (missingMetadata === 'thin_content') {
        query.$or = [{ customContent: { $exists: false } }, { customContent: { $regex: /^.{0,200}$/ } }];
      } else if (missingMetadata === 'all_issues') {
        query.$or = [
          { seoTitle: '' },
          { metaDescription: '' },
          { canonicalUrl: '' },
          { customContent: { $regex: /^.{0,200}$/ } },
        ];
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      CityProduct.find(query)
        .populate('city', 'name slug isVerified status state')
        .populate('product', 'name slug category status isActive images')
        .populate('createdBy', 'name email role')
        .populate('updatedBy', 'name email role')
        .populate('approvedBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      CityProduct.countDocuments(query),
    ]);

    // Batch evaluate SEO quality indicators for listing
    const enhancedItems = await Promise.all(
      items.map(async (item) => {
        let mapping = null;
        if (item.city && item.product) {
          mapping = await ProductCityMapping.findOne({
            city: item.city._id,
            product: item.product._id,
          }).select('isAvailable').lean();
        }

        const audit = evaluateSeoQuality({
          cityProduct: item,
          city: item.city,
          product: item.product,
          mapping,
        });

        return {
          ...item,
          seoAudit: {
            score: audit.seoScore,
            isPublishable: audit.isPublishable,
            blockersCount: audit.blockers.length,
            warningsCount: audit.warnings.length,
            blockers: audit.blockers,
            warnings: audit.warnings,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      cityProducts: enhancedItems,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET single CityProduct by ID with revisions summary and quality audit
export const getCityProductById = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id)
      .populate('city')
      .populate('product')
      .populate('relatedProducts', 'name slug category images')
      .populate('relatedCities', 'name slug state')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .populate('approvedBy', 'name email role');

    if (!item) {
      return res.status(404).json({ success: false, message: 'City-Product SEO page not found.' });
    }

    const mapping = await ProductCityMapping.findOne({
      city: item.city?._id,
      product: item.product?._id,
    }).lean();

    const audit = evaluateSeoQuality({
      cityProduct: item,
      city: item.city,
      product: item.product,
      mapping,
    });

    const revisionCount = await PageRevision.countDocuments({ pageId: item._id });

    return res.status(200).json({
      success: true,
      cityProduct: item,
      mapping,
      seoAudit: audit,
      totalRevisions: revisionCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE CityProduct (Draft only, enforces verified city + mapped product)
export const createCityProduct = async (req, res) => {
  try {
    const {
      cityId,
      city: rawCity,
      productId,
      product: rawProduct,
      pageName,
      h1Heading,
      introContent,
      customContent,
      benefits = [],
      applications = [],
      serviceDetails = '',
      localBusinessInfo = {},
      featuredImages = [],
      relatedProducts = [],
      relatedCities = [],
      customFaqs = [],
      customSpecs = {},
      enquiryCta,
      seoTitle,
      metaDescription,
      canonicalUrl,
      robotsDirective = 'index, follow',
      ogTitle,
      ogDescription,
      ogImage,
      schemaType = 'Product',
      internalLinks = [],
    } = req.body;

    const targetCityId = cityId || rawCity;
    const targetProductId = productId || rawProduct;

    if (!targetCityId || !targetProductId) {
      return res.status(400).json({
        success: false,
        message: 'Please select both a verified city and an active product.',
      });
    }

    // 1. Verify Parent City
    const city = await City.findById(targetCityId);
    if (!city) return res.status(404).json({ success: false, message: 'Selected city not found.' });
    if (!city.isVerified) {
      return res.status(400).json({
        success: false,
        message: `Cannot target '${city.name}' because service availability is not verified. Please verify the city service area first.`,
      });
    }

    // 2. Verify Parent Product
    const product = await Product.findById(targetProductId);
    if (!product) return res.status(404).json({ success: false, message: 'Selected product not found.' });

    // 3. Strict Check: Product × City Availability Mapping must exist & be enabled
    const mapping = await ProductCityMapping.findOne({
      city: city._id,
      product: product._id,
      isAvailable: true,
    });

    if (!mapping) {
      return res.status(400).json({
        success: false,
        requiresMapping: true,
        message: `Product '${product.name}' is not mapped or currently disabled in '${city.name}'. You must enable availability in the Product × City Matrix before creating a dedicated SEO landing page.`,
      });
    }

    // 4. Duplicate Check
    const existing = await CityProduct.findOne({ city: city._id, product: product._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A landing page for '${city.name}' + '${product.name}' already exists (Slug: ${existing.slug}).`,
      });
    }

    const combinedSlug = `${city.slug}/${product.slug}`;
    const sanitizedCustomContent = sanitizeHtmlContent(
      customContent ||
        `RP Storage Solution provides customized, heavy-duty ${product.name} engineered specifically for retail stores, commercial warehouses, and industrial units across ${city.name}. Built with certified high-tensile steel, 8-tank chemical pre-treatment, and electrostatic powder coating, our storage systems maximize your floor capacity and vertical storage density.`
    );
    const sanitizedIntro = sanitizeHtmlContent(introContent || '');

    const finalH1 = sanitizePlainText(h1Heading || `${product.name} in ${city.name} | Heavy Duty Industrial & Retail Racks`);
    const finalSeoTitle = sanitizePlainText(seoTitle || `Top ${product.name} Manufacturers in ${city.name} | RP Storage Solution`);
    const finalMetaDesc = sanitizePlainText(
      metaDescription ||
        `Looking for high-grade ${product.name} in ${city.name}? RP Storage Solution offers heavy-duty, powder-coated racking systems with direct factory delivery and on-site setup in ${city.name}.`
    );
    const finalCanonical = canonicalUrl || `https://www.rpstoragesolution.com/locations/${combinedSlug}/`;

    const cityProduct = await CityProduct.create({
      city: city._id,
      citySlug: city.slug,
      cityName: city.name,
      product: product._id,
      productSlug: product.slug,
      productName: product.name,
      slug: combinedSlug,
      pageName: pageName || `${product.name} — ${city.name}`,
      h1Heading: finalH1,
      introContent: sanitizedIntro,
      customContent: sanitizedCustomContent,
      benefits: Array.isArray(benefits) ? benefits.map((b) => sanitizePlainText(String(b))) : [],
      applications: Array.isArray(applications) ? applications.map((a) => sanitizePlainText(String(a))) : [],
      serviceDetails: sanitizeHtmlContent(serviceDetails),
      localBusinessInfo: {
        hubName: sanitizePlainText(localBusinessInfo.hubName || `${city.name} Distribution Hub`),
        warehouseAddress: sanitizePlainText(localBusinessInfo.warehouseAddress || ''),
        servicePhone: sanitizePlainText(localBusinessInfo.servicePhone || '+91 99900 23436'),
        deliveryTimelines: sanitizePlainText(localBusinessInfo.deliveryTimelines || '48-72 hours dispatch'),
        verifiedServiceArea: sanitizePlainText(localBusinessInfo.verifiedServiceArea || `${city.name} Industrial Areas`),
      },
      featuredImages,
      relatedProducts,
      relatedCities,
      customFaqs: customFaqs.map((f) => ({
        question: sanitizePlainText(f.question || ''),
        answer: sanitizeHtmlContent(f.answer || ''),
      })),
      customSpecs,
      enquiryCta: enquiryCta || {
        heading: `Request Factory Direct Quote for ${product.name}`,
        subheading: `Free site survey and layout drawing available in ${city.name}.`,
        buttonText: 'Get Free Estimate',
        phone: '+91 99900 23436',
      },
      seoTitle: finalSeoTitle,
      metaDescription: finalMetaDesc,
      canonicalUrl: finalCanonical,
      robotsDirective: robotsDirective || 'index, follow',
      ogTitle: sanitizePlainText(ogTitle || finalSeoTitle),
      ogDescription: sanitizePlainText(ogDescription || finalMetaDesc),
      ogImage: ogImage || (featuredImages[0]?.url || ''),
      schemaType: schemaType || 'Product',
      internalLinks: internalLinks.map((l) => ({
        anchorText: sanitizePlainText(l.anchorText || ''),
        targetUrl: sanitizePlainText(l.targetUrl || ''),
      })),
      status: 'draft', // Always begins as draft
      version: 1,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    // Save initial version snapshot
    await recordRevisionSnapshot({
      page: cityProduct,
      user: req.user,
      action: 'CREATE_DRAFT',
      changeSummary: 'Initial SEO landing page draft created',
    });

    await logAudit({
      req,
      action: 'CREATE_CITY_PRODUCT',
      entityType: 'CityProduct',
      entityId: cityProduct._id,
      details: `Created City-Product landing page draft for '${city.name}' + '${product.name}'`,
    });

    return res.status(201).json({ success: true, cityProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE CityProduct (With Stale Approval Invalidation & Revision History)
export const updateCityProduct = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'City-Product SEO page not found.' });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.city;
    delete updates.product;
    delete updates.slug;
    delete updates.citySlug;
    delete updates.productSlug;
    delete updates.cityName;
    delete updates.productName;

    // Sanitize rich text and string fields
    if (updates.customContent) updates.customContent = sanitizeHtmlContent(updates.customContent);
    if (updates.introContent) updates.introContent = sanitizeHtmlContent(updates.introContent);
    if (updates.serviceDetails) updates.serviceDetails = sanitizeHtmlContent(updates.serviceDetails);
    if (updates.h1Heading) updates.h1Heading = sanitizePlainText(updates.h1Heading);
    if (updates.seoTitle) updates.seoTitle = sanitizePlainText(updates.seoTitle);
    if (updates.metaDescription) updates.metaDescription = sanitizePlainText(updates.metaDescription);
    if (updates.benefits && Array.isArray(updates.benefits)) {
      updates.benefits = updates.benefits.map((b) => sanitizePlainText(String(b)));
    }
    if (updates.applications && Array.isArray(updates.applications)) {
      updates.applications = updates.applications.map((a) => sanitizePlainText(String(a)));
    }

    // STALE APPROVAL INVALIDATION RULE:
    // If the page was previously approved and substantive content is modified,
    // reset status back to review/draft to prevent unreviewed edits going live.
    let approvalInvalidated = false;
    if (item.status === 'approved') {
      item.status = 'review';
      item.reviewNotes = `Content updated by ${req.user.name || 'Editor'}. Previous approval invalidated.`;
      approvalInvalidated = true;
    }

    updates.updatedBy = req.user._id;
    Object.assign(item, updates);
    await item.save();

    // Create a revision snapshot
    const newVersion = await recordRevisionSnapshot({
      page: item,
      user: req.user,
      action: 'UPDATE_CONTENT',
      changeSummary: req.body.changeSummary || (approvalInvalidated ? 'Content edited; approval invalidated' : 'Content update'),
    });

    if (item.status === 'published') {
      purgeSeoCache();
    }

    await logAudit({
      req,
      action: 'UPDATE_CITY_PRODUCT',
      entityType: 'CityProduct',
      entityId: item._id,
      details: `Updated City-Product '${item.slug}' (v${newVersion})${approvalInvalidated ? ' - Stale approval invalidated' : ''}`,
    });

    return res.status(200).json({
      success: true,
      cityProduct: item,
      approvalInvalidated,
      message: approvalInvalidated
        ? 'Content updated. Since changes were made, previous approval has been reset to "In Review".'
        : 'Page updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// SUBMIT FOR REVIEW (Draft / Changes Requested -> Review)
export const submitForReview = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Page not found.' });

    if (item.status === 'published') {
      return res.status(400).json({ success: false, message: 'Page is already published.' });
    }

    item.status = 'review';
    item.reviewNotes = req.body.reviewNotes || 'Submitted for editorial review';
    item.updatedBy = req.user._id;
    await item.save();

    await recordRevisionSnapshot({
      page: item,
      user: req.user,
      action: 'SUBMIT_REVIEW',
      changeSummary: item.reviewNotes,
    });

    await logAudit({
      req,
      action: 'SUBMIT_FOR_REVIEW',
      entityType: 'CityProduct',
      entityId: item._id,
      details: `Submitted '${item.slug}' for review by ${req.user.name}`,
    });

    return res.status(200).json({
      success: true,
      cityProduct: item,
      message: `Page '${item.slug}' has been submitted for editorial review.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// APPROVE PAGE (Review -> Approved)
export const approveCityProduct = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id).populate('city').populate('product');
    if (!item) return res.status(404).json({ success: false, message: 'Page not found.' });

    // Validate availability before approval
    const mapping = await ProductCityMapping.findOne({
      city: item.city._id,
      product: item.product._id,
      isAvailable: true,
    });

    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve: Product × City Availability Mapping is missing or disabled.',
      });
    }

    item.status = 'approved';
    item.approvedBy = req.user._id;
    item.approvedAt = new Date();
    item.reviewNotes = req.body.notes || 'Approved for publication';
    item.rejectionReason = '';
    item.updatedBy = req.user._id;
    await item.save();

    await recordRevisionSnapshot({
      page: item,
      user: req.user,
      action: 'APPROVE',
      changeSummary: `Approved by ${req.user.name}`,
    });

    await logAudit({
      req,
      action: 'APPROVE_CITY_PRODUCT',
      entityType: 'CityProduct',
      entityId: item._id,
      details: `Approved page '${item.slug}' for publication`,
    });

    return res.status(200).json({
      success: true,
      cityProduct: item,
      message: `Page '${item.slug}' is approved and ready for publishing.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// REQUEST CHANGES (Review -> Changes Requested)
export const requestChanges = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a clear reason or feedback for requested changes.' });
    }

    const item = await CityProduct.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Page not found.' });

    item.status = 'changes_requested';
    item.rejectionReason = reason.trim();
    item.updatedBy = req.user._id;
    await item.save();

    await recordRevisionSnapshot({
      page: item,
      user: req.user,
      action: 'REQUEST_CHANGES',
      changeSummary: `Changes requested: ${reason}`,
    });

    await logAudit({
      req,
      action: 'REQUEST_CHANGES',
      entityType: 'CityProduct',
      entityId: item._id,
      details: `Changes requested for '${item.slug}': ${reason}`,
    });

    return res.status(200).json({
      success: true,
      cityProduct: item,
      message: `Changes requested for '${item.slug}'. Editor will see notes.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUBLISH CityProduct (Approved -> Published)
export const publishCityProduct = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id)
      .populate('city')
      .populate('product');

    if (!item) return res.status(404).json({ success: false, message: 'Page not found.' });

    // 1. Parent City Verification Check
    if (!item.city || !item.city.isVerified || item.city.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: `Cannot publish: Target city '${item.cityName}' must be verified and published first.`,
      });
    }

    // 2. Parent Product Check
    if (!item.product || item.product.status !== 'published' || !item.product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Cannot publish: Associated product '${item.productName}' must be active and published.`,
      });
    }

    // 3. Mapping Check
    const mapping = await ProductCityMapping.findOne({
      city: item.city._id,
      product: item.product._id,
      isAvailable: true,
    });

    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: `Cannot publish: Availability mapping for '${item.productName}' in '${item.cityName}' is missing or disabled.`,
      });
    }

    // 4. Quality Blocker Check
    const quality = evaluateSeoQuality({
      cityProduct: item,
      city: item.city,
      product: item.product,
      mapping,
    });

    if (!quality.isPublishable) {
      return res.status(400).json({
        success: false,
        message: `Cannot publish due to SEO blockers: ${quality.blockers.join(' ')}`,
        blockers: quality.blockers,
      });
    }

    // 5. Workflow Stage Check: Must be 'approved' unless Super Admin forces override
    const isSuperAdmin = req.user.role === 'super_admin';
    if (item.status !== 'approved' && !isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: `Cannot publish: Page is currently in '${item.status}' status. It must be submitted and approved before publishing.`,
      });
    }

    const previousStatus = item.status;
    item.status = 'published';
    item.publishedAt = new Date();
    item.updatedBy = req.user._id;
    await item.save();

    purgeSeoCache();

    await recordRevisionSnapshot({
      page: item,
      user: req.user,
      action: 'PUBLISH',
      changeSummary: `Published to production${previousStatus !== 'approved' ? ' (Super Admin override)' : ''}`,
    });

    await logAudit({
      req,
      action: 'PUBLISH_CITY_PRODUCT',
      entityType: 'CityProduct',
      entityId: item._id,
      details: `Published City-Product page '${item.slug}'`,
    });

    return res.status(200).json({
      success: true,
      cityProduct: item,
      message: `Page /locations/${item.slug}/ is now live and indexed.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UNPUBLISH CityProduct (Published -> Draft)
export const unpublishCityProduct = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Page not found.' });

    item.status = 'draft';
    item.updatedBy = req.user._id;
    await item.save();

    purgeSeoCache();

    await recordRevisionSnapshot({
      page: item,
      user: req.user,
      action: 'UNPUBLISH',
      changeSummary: 'Unpublished page back to draft',
    });

    await logAudit({
      req,
      action: 'UNPUBLISH_CITY_PRODUCT',
      entityType: 'CityProduct',
      entityId: item._id,
      details: `Unpublished City-Product page '${item.slug}'`,
    });

    return res.status(200).json({
      success: true,
      cityProduct: item,
      message: `Page '${item.slug}' unpublished. Public URL now returns 404.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET REVISION HISTORY
export const getPageRevisions = async (req, res) => {
  try {
    const revisions = await PageRevision.find({ pageId: req.params.id })
      .sort({ version: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      revisions,
      total: revisions.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// RESTORE PREVIOUS REVISION (Rollback snapshot into new draft)
export const restorePageRevision = async (req, res) => {
  try {
    const { id, version } = req.params;

    const [page, targetRevision] = await Promise.all([
      CityProduct.findById(id),
      PageRevision.findOne({ pageId: id, version: parseInt(version, 10) }),
    ]);

    if (!page) return res.status(404).json({ success: false, message: 'City-Product page not found.' });
    if (!targetRevision) {
      return res.status(404).json({ success: false, message: `Revision v${version} not found.` });
    }

    const snapshot = targetRevision.snapshot;
    delete snapshot._id;
    delete snapshot.createdAt;
    delete snapshot.updatedAt;
    delete snapshot.__v;

    // Restore content but place into draft status for safe review
    Object.assign(page, snapshot);
    page.status = 'draft';
    page.reviewNotes = `Restored from version v${version} by ${req.user.name}`;
    page.updatedBy = req.user._id;
    await page.save();

    purgeSeoCache();

    const newVersion = await recordRevisionSnapshot({
      page,
      user: req.user,
      action: 'RESTORE_VERSION',
      changeSummary: `Restored snapshot from v${version}`,
    });

    await logAudit({
      req,
      action: 'RESTORE_PAGE_REVISION',
      entityType: 'CityProduct',
      entityId: page._id,
      details: `Restored '${page.slug}' from v${version} into new v${newVersion}`,
    });

    return res.status(200).json({
      success: true,
      cityProduct: page,
      message: `Successfully restored version v${version} into a new draft (v${newVersion}).`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET DRAFT PREVIEW DATA (Role-protected preview for unpublished content)
export const getCityProductPreview = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id)
      .populate('city')
      .populate('product')
      .populate('relatedProducts', 'name slug category images')
      .populate('relatedCities', 'name slug state')
      .lean();

    if (!item) return res.status(404).json({ success: false, message: 'Page not found.' });

    // Generate secure preview token with expiry
    const secret = process.env.JWT_SECRET || 'rp-storage-preview-secret-key-development';
    const expiresAt = Date.now() + 3600 * 1000; // 1 hour
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${item._id}:${expiresAt}`)
      .digest('hex');

    const previewToken = `${expiresAt}.${signature}`;

    return res.status(200).json({
      success: true,
      cityProduct: item,
      previewToken,
      previewUrl: `http://localhost:5173/preview/locations/${item.citySlug}/${item.productSlug}?token=${previewToken}`,
      noindex: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// AUDIT QUALITY ENDPOINT (Real-time feedback)
export const auditCityProductQuality = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id)
      .populate('city')
      .populate('product');

    if (!item) return res.status(404).json({ success: false, message: 'Page not found.' });

    const mapping = await ProductCityMapping.findOne({
      city: item.city?._id,
      product: item.product?._id,
    }).lean();

    const audit = evaluateSeoQuality({
      cityProduct: item,
      city: item.city,
      product: item.product,
      mapping,
    });

    return res.status(200).json({
      success: true,
      audit,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE CityProduct
export const deleteCityProduct = async (req, res) => {
  try {
    const item = await CityProduct.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Page not found.' });

    const slug = item.slug;
    await item.deleteOne();
    await PageRevision.deleteMany({ pageId: req.params.id });

    purgeSeoCache();

    await logAudit({
      req,
      action: 'DELETE_CITY_PRODUCT',
      entityType: 'CityProduct',
      entityId: req.params.id,
      details: `Deleted City-Product page '${slug}' and its revision history`,
    });

    return res.status(200).json({ success: true, message: 'Deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
