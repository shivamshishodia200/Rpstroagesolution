import slugify from 'slugify';
import { City } from '../models/City.js';
import { CityProduct } from '../models/CityProduct.js';
import { logAudit } from '../utils/audit.js';
import { invalidateCityCache } from '../services/cacheManager.js';

// GET all cities with filtering, search, pagination
export const getCities = async (req, res) => {
  try {
    const { search, state, status, isVerified, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { localRelevance: { $regex: search, $options: 'i' } },
      ];
    }
    if (state) query.state = state;
    if (status) query.status = status;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [cities, total] = await Promise.all([
      City.find(query).sort(sort).skip(skip).limit(parseInt(limit, 10)).lean(),
      City.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      cities,
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

// GET single city by ID
export const getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    return res.status(200).json({ success: true, city });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE new city
export const createCity = async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      state,
      serviceAvailability = 'pending_verification',
      verificationNotes = '',
      isVerified = false,
      featuredImage = '/images/banner3.jpeg',
      imageAlt = '',
      description = '',
      localRelevance = '',
      h1Heading = '',
      introContent = '',
      serviceDetails = '',
      faqs = [],
      seoTitle = '',
      metaDescription = '',
      canonicalUrl = '',
      status = 'draft',
    } = req.body;

    if (!name || !state) {
      return res.status(400).json({ success: false, message: 'City name and state are required.' });
    }

    const normalizedSlug = (customSlug || slugify(name, { lower: true, strict: true })).toLowerCase().trim();

    const existing = await City.findOne({ slug: normalizedSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A city with the slug '${normalizedSlug}' already exists. Slugs must be unique.`,
      });
    }

    // Auto-fill canonical if not set
    const finalCanonical = canonicalUrl || `https://www.rpstoragesolution.com/locations/${normalizedSlug}/`;
    const finalH1 = h1Heading || `Storage & Supermarket Racks in ${name}`;
    const finalSeoTitle = seoTitle || `Best Storage Racks Manufacturer in ${name} | RP Storage Solution`;
    const finalMetaDesc =
      metaDescription ||
      `Premier industrial storage racks, retail display racks, and supermarket shelving in ${name}. 35+ years of engineering excellence. Direct factory delivery.`;

    const city = await City.create({
      name: name.trim(),
      slug: normalizedSlug,
      state: state.trim(),
      serviceAvailability,
      verificationNotes,
      isVerified: serviceAvailability === 'verified' ? true : isVerified,
      featuredImage,
      imageAlt: imageAlt || `RP Storage Solution Racking Installations in ${name}`,
      description,
      localRelevance,
      h1Heading: finalH1,
      introContent,
      serviceDetails,
      faqs,
      seoTitle: finalSeoTitle,
      metaDescription: finalMetaDesc,
      canonicalUrl: finalCanonical,
      status: status === 'published' ? 'draft' : status, // enforce review before publish if new
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'CREATE_CITY',
      entityType: 'City',
      entityId: city._id,
      details: `Created city '${city.name}' (${city.slug}) in state ${city.state}`,
    });

    return res.status(201).json({ success: true, city });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE city
export const updateCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const updates = { ...req.body, updatedBy: req.user._id };

    if (updates.slug && updates.slug !== city.slug) {
      const normalizedSlug = slugify(updates.slug, { lower: true, strict: true });
      const duplicate = await City.findOne({ slug: normalizedSlug, _id: { $ne: city._id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Slug '${normalizedSlug}' is already in use by another city.`,
        });
      }
      updates.slug = normalizedSlug;
    }

    if (updates.serviceAvailability === 'verified') {
      updates.isVerified = true;
    } else if (updates.serviceAvailability === 'unavailable') {
      updates.isVerified = false;
    }

    Object.assign(city, updates);
    await city.save();

    await logAudit({
      req,
      action: 'UPDATE_CITY',
      entityType: 'City',
      entityId: city._id,
      details: `Updated city '${city.name}'`,
    });

    return res.status(200).json({ success: true, city });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// SUBMIT CITY FOR REVIEW
export const submitCityForReview = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    city.status = 'review';
    city.updatedBy = req.user._id;
    await city.save();

    await logAudit({
      req,
      action: 'SUBMIT_CITY_REVIEW',
      entityType: 'City',
      entityId: city._id,
      details: `City '${city.name}' submitted for editorial review`,
    });

    return res.status(200).json({ success: true, city, message: 'Submitted for editorial and SEO review.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// APPROVE CITY
export const approveCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    city.status = 'approved';
    city.updatedBy = req.user._id;
    await city.save();

    await logAudit({
      req,
      action: 'APPROVE_CITY',
      entityType: 'City',
      entityId: city._id,
      details: `City '${city.name}' approved for publishing`,
    });

    return res.status(200).json({ success: true, city, message: 'City approved.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUBLISH CITY
export const publishCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    // Enforce required checks from Section 4
    if (!city.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish unverified service area. Service availability must be verified with notes first.',
      });
    }

    if (!city.seoTitle || !city.metaDescription || !city.h1Heading) {
      return res.status(400).json({
        success: false,
        message: 'Required SEO fields (SEO Title, Meta Description, H1 Heading) must be completed before publishing.',
      });
    }

    city.status = 'published';
    city.publishedAt = new Date();
    city.updatedBy = req.user._id;
    await city.save();

    await logAudit({
      req,
      action: 'PUBLISH_CITY',
      entityType: 'City',
      entityId: city._id,
      details: `Published city landing page for '${city.name}' (${city.slug})`,
    });

    invalidateCityCache(city.slug, `City '${city.name}' published`);

    return res.status(200).json({ success: true, city, message: `City '${city.name}' is now live on the public website.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UNPUBLISH CITY
export const unpublishCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    city.status = 'draft';
    city.updatedBy = req.user._id;
    await city.save();

    await logAudit({
      req,
      action: 'UNPUBLISH_CITY',
      entityType: 'City',
      entityId: city._id,
      details: `Unpublished city '${city.name}'`,
    });

    invalidateCityCache(city.slug, `City '${city.name}' unpublished`);

    return res.status(200).json({ success: true, city, message: `City '${city.name}' has been unpublished.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE CITY SAFELY
export const deleteCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    // Check for dependent CityProduct pages
    const dependentCount = await CityProduct.countDocuments({ city: city._id });
    if (dependentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete '${city.name}' because ${dependentCount} city-product SEO page(s) depend on it. Delete or reassign those pages first.`,
      });
    }

    await city.deleteOne();

    await logAudit({
      req,
      action: 'DELETE_CITY',
      entityType: 'City',
      entityId: req.params.id,
      details: `Deleted city '${city.name}'`,
    });

    invalidateCityCache(city.slug, `City '${city.name}' deleted`);

    return res.status(200).json({ success: true, message: `City '${city.name}' deleted successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
