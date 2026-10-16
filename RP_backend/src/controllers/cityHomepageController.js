import { CityHomepage } from '../models/CityHomepage.js';
import { City } from '../models/City.js';
import { PageRevision } from '../models/PageRevision.js';
import { logAudit } from '../utils/audit.js';
import { invalidateCityCache, purgeAllCache } from '../services/cacheManager.js';
import {
  resolveHomepageContent,
  generateCityHomepagePreviewToken,
} from '../services/homepageResolver.js';
import { analyzeCommonContentImpact } from '../services/impactAnalysis.js';

/**
 * GET /api/admin/city-homepages
 * List all city homepage configurations with city info and workflow status
 */
export const getCityHomepages = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    let configs = await CityHomepage.find(filter)
      .populate('city', 'name slug state isVerified serviceAvailability')
      .populate('approvedBy', 'name email role')
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    if (search) {
      const q = search.toLowerCase().trim();
      configs = configs.filter(
        (c) =>
          c.cityName?.toLowerCase().includes(q) ||
          c.citySlug?.toLowerCase().includes(q) ||
          c.stateName?.toLowerCase().includes(q)
      );
    }

    // Also fetch all verified cities to show which ones haven't been configured yet
    const allVerifiedCities = await City.find({ isVerified: true, status: 'published' })
      .select('name slug state')
      .sort({ name: 1 })
      .lean();

    const configuredCityIds = new Set(configs.map((c) => c.city?._id?.toString()));
    const unconfiguredCities = allVerifiedCities.filter(
      (c) => !configuredCityIds.has(c._id.toString())
    );

    return res.status(200).json({
      success: true,
      configs,
      total: configs.length,
      unconfiguredCities,
      totalVerifiedCities: allVerifiedCities.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/city-homepages
 * Create a new CityHomepage configuration for a verified city
 */
export const createCityHomepage = async (req, res) => {
  try {
    const { cityId, sectionOverrides = {}, seo = {} } = req.body;

    if (!cityId) {
      return res.status(400).json({ success: false, message: 'City ID is required' });
    }

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    // Guardrail: Parent city must be verified
    if (!city.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'City homepage can only be configured for verified service cities.',
      });
    }

    // Check if configuration already exists
    const existing = await CityHomepage.findOne({ city: city._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `City homepage configuration already exists for ${city.name}`,
      });
    }

    const newConfig = new CityHomepage({
      city: city._id,
      citySlug: city.slug,
      cityName: city.name,
      stateName: city.state,
      inheritHomepage: true,
      ...sectionOverrides,
      seo: {
        title: seo.title || `${city.name} Storage Racks & Industrial Shelving Manufacturer | RP Storage`,
        description: seo.description || `Leading manufacturer of industrial warehouse racks, pallet racking systems, and supermarket display shelves in ${city.name}. Factory direct supply from Najafgarh.`,
        h1: seo.h1 || `Heavy Duty Warehouse Racks & Storage Systems in ${city.name}`,
        canonicalUrl: seo.canonicalUrl || `https://www.rpstoragesolution.com/locations/${city.slug}`,
        robotsDirective: seo.robotsDirective || 'index, follow',
      },
      status: 'draft',
      version: 1,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    await newConfig.save();

    // Create initial revision snapshot
    await PageRevision.create({
      pageId: newConfig._id,
      pageType: 'CityHomepage',
      version: 1,
      snapshot: newConfig.toObject(),
      author: req.user?._id,
      authorName: req.user?.name || 'Administrator',
      authorEmail: req.user?.email || '',
      changeSummary: `Created city homepage configuration for ${city.name}`,
      workflowAction: 'CREATE_DRAFT',
    });

    await logAudit({
      req,
      action: 'CREATE_CITY_HOMEPAGE',
      entityType: 'CityHomepage',
      entityId: newConfig._id,
      details: { cityName: city.name, slug: city.slug },
    });

    return res.status(201).json({
      success: true,
      config: newConfig,
      data: newConfig,
      message: `City homepage configuration created for ${city.name}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/city-homepages/:id
 * Retrieve configuration details with resolved preview values
 */
export const getCityHomepageById = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await CityHomepage.findById(id)
      .populate('city', 'name slug state isVerified serviceAvailability verificationNotes localRelevance featuredImage')
      .populate('approvedBy', 'name email role')
      .populate('updatedBy', 'name email')
      .lean();

    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage configuration not found' });
    }

    // Resolve inherited preview
    const previewData = await resolveHomepageContent({
      citySlug: config.citySlug,
      isPreview: true,
    });

    return res.status(200).json({
      success: true,
      config,
      data: config,
      resolvedPreview: previewData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/city-homepages/:id
 * Update overrides, section modes, or SEO fields
 */
export const updateCityHomepage = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await CityHomepage.findById(id);

    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage configuration not found' });
    }

    const allowedSections = [
      'hero',
      'trustStrip',
      'about',
      'featuredProducts',
      'industries',
      'statistics',
      'benefits',
      'projects',
      'testimonials',
      'faqs',
      'enquiryCta',
      'seo',
      'inheritHomepage',
    ];

    let hasChanges = false;
    const overrides = req.body.sectionOverrides || {};

    for (const key of allowedSections) {
      if (req.body[key] !== undefined) {
        config[key] = req.body[key];
        config.markModified(key);
        hasChanges = true;
      } else if (overrides[key] !== undefined) {
        config[key] = overrides[key];
        config.markModified(key);
        hasChanges = true;
      }
    }

    if (req.body.seo !== undefined) {
      config.seo = req.body.seo;
      config.markModified('seo');
      hasChanges = true;
    }

    if (req.body.inheritHomepage !== undefined) {
      config.inheritHomepage = req.body.inheritHomepage;
      hasChanges = true;
    }
    if (req.body.enabled !== undefined) {
      config.enabled = req.body.enabled;
      hasChanges = true;
    }

    if (!hasChanges) {
      return res.status(400).json({ success: false, message: 'No valid update fields provided' });
    }

    // Stale approval guardrail: modifying an approved page drops it back to review
    if (config.status === 'approved') {
      config.status = 'review';
      config.reviewNotes = 'Content modified after approval; reset to review for editorial sign-off.';
    }

    config.version += 1;
    config.updatedBy = req.user?._id;
    await config.save();

    // Create revision snapshot
    await PageRevision.create({
      pageId: config._id,
      pageType: 'CityHomepage',
      version: config.version,
      snapshot: config.toObject(),
      author: req.user?._id,
      authorName: req.user?.name || 'Administrator',
      authorEmail: req.user?.email || '',
      changeSummary: req.body.changeSummary || `Updated section overrides (v${config.version})`,
      workflowAction: 'UPDATE_CONTENT',
    });

    // Invalidate cache if currently published
    if (config.status === 'published') {
      invalidateCityCache(config.citySlug, `City homepage updated (v${config.version})`);
    }

    return res.status(200).json({
      success: true,
      config,
      data: config,
      message: `City homepage updated (v${config.version})`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/city-homepages/:id/submit-review
 */
export const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await CityHomepage.findById(id);

    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage not found' });
    }

    config.status = 'review';
    config.updatedBy = req.user?._id;
    await config.save();

    await PageRevision.create({
      pageId: config._id,
      pageType: 'CityHomepage',
      version: config.version,
      snapshot: config.toObject(),
      author: req.user?._id,
      authorName: req.user?.name || 'Editor',
      authorEmail: req.user?.email || '',
      changeSummary: 'Submitted for editorial review',
      workflowAction: 'SUBMIT_REVIEW',
    });

    return res.status(200).json({
      success: true,
      config,
      data: config,
      message: 'City homepage submitted for review',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/city-homepages/:id/approve
 */
export const approveCityHomepage = async (req, res) => {
  try {
    const { id } = req.params;

    // RBAC: SEO Manager or Super Admin only
    if (req.user?.role !== 'super_admin' && req.user?.role !== 'seo_manager') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Administrators or SEO Managers can approve city homepages.',
      });
    }

    const config = await CityHomepage.findById(id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage not found' });
    }

    config.status = 'approved';
    config.approvedBy = req.user?._id;
    config.approvedAt = new Date();
    config.rejectionReason = '';
    config.updatedBy = req.user?._id;
    await config.save();

    await PageRevision.create({
      pageId: config._id,
      pageType: 'CityHomepage',
      version: config.version,
      snapshot: config.toObject(),
      author: req.user?._id,
      authorName: req.user?.name || 'SEO Manager',
      authorEmail: req.user?.email || '',
      changeSummary: 'Approved for publication',
      workflowAction: 'APPROVE',
    });

    return res.status(200).json({
      success: true,
      config,
      data: config,
      message: 'City homepage approved for publication',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/city-homepages/:id/request-changes
 */
export const requestChangesCityHomepage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    // RBAC
    if (req.user?.role !== 'super_admin' && req.user?.role !== 'seo_manager') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Administrators or SEO Managers can request changes.',
      });
    }

    const config = await CityHomepage.findById(id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage not found' });
    }

    config.status = 'changes_requested';
    config.rejectionReason = reason;
    config.updatedBy = req.user?._id;
    await config.save();

    await PageRevision.create({
      pageId: config._id,
      pageType: 'CityHomepage',
      version: config.version,
      snapshot: config.toObject(),
      author: req.user?._id,
      authorName: req.user?.name || 'SEO Manager',
      authorEmail: req.user?.email || '',
      changeSummary: `Changes requested: ${reason}`,
      workflowAction: 'REQUEST_CHANGES',
    });

    return res.status(200).json({
      success: true,
      config,
      data: config,
      message: 'Changes requested for city homepage',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/city-homepages/:id/publish
 */
export const publishCityHomepage = async (req, res) => {
  try {
    const { id } = req.params;

    // RBAC
    if (req.user?.role !== 'super_admin' && req.user?.role !== 'seo_manager') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Administrators or SEO Managers can publish city homepages.',
      });
    }

    const config = await CityHomepage.findById(id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage not found' });
    }

    // Guardrail: Parent city must still be verified & published
    const city = await City.findById(config.city);
    if (!city || !city.isVerified || city.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish city homepage because parent city is not published or verified.',
      });
    }

    config.status = 'published';
    config.publishedAt = new Date();
    config.updatedBy = req.user?._id;
    await config.save();

    await PageRevision.create({
      pageId: config._id,
      pageType: 'CityHomepage',
      version: config.version,
      snapshot: config.toObject(),
      author: req.user?._id,
      authorName: req.user?.name || 'SEO Manager',
      authorEmail: req.user?.email || '',
      changeSummary: `Published city homepage (v${config.version})`,
      workflowAction: 'PUBLISH',
    });

    // Invalidate caches
    invalidateCityCache(config.citySlug, `City homepage published: ${config.cityName}`);

    await logAudit({
      req,
      action: 'PUBLISH_CITY_HOMEPAGE',
      entityType: 'CityHomepage',
      entityId: config._id,
      details: { cityName: config.cityName, slug: config.citySlug },
    });

    return res.status(200).json({
      success: true,
      config,
      data: config,
      message: `City homepage for ${config.cityName} published successfully`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/city-homepages/:id/unpublish
 */
export const unpublishCityHomepage = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'super_admin' && req.user?.role !== 'seo_manager') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Administrators or SEO Managers can unpublish city homepages.',
      });
    }

    const config = await CityHomepage.findById(id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage not found' });
    }

    config.status = 'unpublished';
    config.updatedBy = req.user?._id;
    await config.save();

    await PageRevision.create({
      pageId: config._id,
      pageType: 'CityHomepage',
      version: config.version,
      snapshot: config.toObject(),
      author: req.user?._id,
      authorName: req.user?.name || 'SEO Manager',
      authorEmail: req.user?.email || '',
      changeSummary: 'Unpublished city homepage',
      workflowAction: 'UNPUBLISH',
    });

    invalidateCityCache(config.citySlug, `City homepage unpublished: ${config.cityName}`);

    return res.status(200).json({
      success: true,
      config,
      data: config,
      message: `City homepage for ${config.cityName} unpublished`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/city-homepages/:id/preview
 * Generate secure signed draft preview token and URL
 */
export const getCityHomepagePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await CityHomepage.findById(id).lean();

    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage not found' });
    }

    const token = generateCityHomepagePreviewToken(config._id, 3600000); // 1-hour TTL
    const previewUrl = `/locations/${config.citySlug}?preview=true&token=${token}`;

    const resolvedPreview = await resolveHomepageContent({
      citySlug: config.citySlug,
      isPreview: true,
      previewToken: token,
    });

    return res.status(200).json({
      success: true,
      previewToken: token,
      previewUrl,
      resolvedPreview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/city-homepages/:id/revisions
 */
export const getCityHomepageRevisions = async (req, res) => {
  try {
    const { id } = req.params;
    const revisions = await PageRevision.find({
      pageId: id,
    })
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

/**
 * POST /api/admin/city-homepages/:id/revisions/:version/restore
 */
export const restoreCityHomepageRevision = async (req, res) => {
  try {
    const { id, version } = req.params;

    if (req.user?.role !== 'super_admin' && req.user?.role !== 'seo_manager') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Administrators or SEO Managers can restore previous versions.',
      });
    }

    const revision = await PageRevision.findOne({
      pageId: id,
      version: parseInt(version, 10),
    }).lean();

    if (!revision) {
      return res.status(404).json({ success: false, message: `Version ${version} not found` });
    }

    const config = await CityHomepage.findById(id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage not found' });
    }

    // Apply snapshot fields
    const snapshot = revision.snapshot;
    const sectionsToRestore = [
      'hero',
      'trustStrip',
      'about',
      'featuredProducts',
      'industries',
      'statistics',
      'benefits',
      'projects',
      'testimonials',
      'faqs',
      'enquiryCta',
      'seo',
      'inheritHomepage',
    ];

    for (const key of sectionsToRestore) {
      if (snapshot[key] !== undefined) {
        config[key] = snapshot[key];
      }
    }

    config.version += 1;
    config.status = 'draft'; // Restored versions become editable drafts
    config.updatedBy = req.user?._id;
    await config.save();

    await PageRevision.create({
      pageId: config._id,
      pageType: 'CityHomepage',
      version: config.version,
      snapshot: config.toObject(),
      author: req.user?._id,
      authorName: req.user?.name || 'SEO Manager',
      authorEmail: req.user?.email || '',
      changeSummary: `Restored content from version v${version} into draft v${config.version}`,
      workflowAction: 'RESTORE_VERSION',
    });

    return res.status(200).json({
      success: true,
      config,
      data: config,
      message: `Version v${version} restored successfully into new draft v${config.version}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/homepage/impact-analysis
 */
export const getCommonContentImpactAnalysis = async (req, res) => {
  try {
    const { sectionKey = 'all' } = req.query;
    const result = await analyzeCommonContentImpact(sectionKey);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/city-homepages/:id
 */
export const deleteCityHomepage = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await CityHomepage.findByIdAndDelete(id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'City homepage not found' });
    }

    if (config.citySlug) {
      invalidateCityCache(config.citySlug, 'City homepage configuration deleted');
    }

    return res.status(200).json({
      success: true,
      message: 'City homepage configuration deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
