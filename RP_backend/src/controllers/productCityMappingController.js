import { ProductCityMapping } from '../models/ProductCityMapping.js';
import { Product } from '../models/Product.js';
import { City } from '../models/City.js';
import { CityProduct } from '../models/CityProduct.js';
import { logAudit } from '../utils/audit.js';
import {
  invalidateCityCache,
  invalidateProductCache,
  purgeAllCache,
} from '../services/cacheManager.js';

/**
 * GET /api/admin/product-city-mappings
 * List mappings with filters & population
 */
export const getMappings = async (req, res) => {
  try {
    const { productId, cityId, isAvailable, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (productId) filter.product = productId;
    if (cityId) filter.city = cityId;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [mappings, total] = await Promise.all([
      ProductCityMapping.find(filter)
        .populate('product', 'name slug category categoryTitle isActive status images')
        .populate('city', 'name slug state isVerified status')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ProductCityMapping.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      mappings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/product-city-mappings/matrix
 * Returns structured data for Product x City Matrix UI:
 * list of products, list of cities, active mappings map, and existing SEO pages map
 */
export const getMappingMatrix = async (req, res) => {
  try {
    const { category, state, search } = req.query;

    const productFilter = { status: { $ne: 'archived' } };
    if (category && category !== 'all') productFilter.category = category;
    if (search) productFilter.name = { $regex: search, $options: 'i' };

    const cityFilter = { status: { $ne: 'archived' } };
    if (state && state !== 'all') cityFilter.state = state;

    const [products, cities, mappings, seoPages] = await Promise.all([
      Product.find(productFilter).select('name slug category categoryTitle isActive status').sort({ name: 1 }).lean(),
      City.find(cityFilter).select('name slug state isVerified status').sort({ state: 1, name: 1 }).lean(),
      ProductCityMapping.find({}).lean(),
      CityProduct.find({ status: 'published' }).select('city product slug status').lean(),
    ]);

    // Map: `${productId}_${cityId}` -> { isAvailable, mappingId, notes }
    const mappingMap = {};
    for (const m of mappings) {
      mappingMap[`${m.product}_${m.city}`] = {
        _id: m._id,
        isAvailable: m.isAvailable,
        availabilityNotes: m.availabilityNotes || '',
      };
    }

    // Map: `${productId}_${cityId}` -> seoPageSlug
    const seoPageMap = {};
    for (const sp of seoPages) {
      seoPageMap[`${sp.product}_${sp.city}`] = sp.slug;
    }

    return res.status(200).json({
      success: true,
      products,
      cities,
      matrix: mappingMap,
      seoPages: seoPageMap,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/product-city-mappings
 * Create or Toggle Single Mapping
 */
export const createOrUpdateMapping = async (req, res) => {
  try {
    const { productId, cityId, isAvailable = true, availabilityNotes = '' } = req.body;

    if (!productId || !cityId) {
      return res.status(400).json({ success: false, message: 'Both productId and cityId are required' });
    }

    // Verify entities exist
    const [product, city] = await Promise.all([
      Product.findById(productId),
      City.findById(cityId),
    ]);

    if (!product || !city) {
      return res.status(404).json({ success: false, message: 'Referenced Product or City does not exist' });
    }

    const mapping = await ProductCityMapping.findOneAndUpdate(
      { product: productId, city: cityId },
      {
        $set: {
          isAvailable: Boolean(isAvailable),
          availabilityNotes: availabilityNotes.trim(),
          updatedBy: req.user?._id,
        },
        $setOnInsert: {
          createdBy: req.user?._id,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    await logAudit({
      req,
      action: 'MAPPING_UPDATE',
      entityType: 'ProductCityMapping',
      entityId: mapping._id,
      details: `${isAvailable ? 'Enabled' : 'Disabled'} availability for '${product.name}' in '${city.name}'`,
    });

    // Invalidate affected caches immediately
    invalidateCityCache(city.slug, `ProductCityMapping changed for ${product.slug}`);
    invalidateProductCache(product.slug, `ProductCityMapping changed for ${city.slug}`);

    return res.status(200).json({ success: true, mapping });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/product-city-mappings/bulk
 * Bulk enable or disable mappings across sets of products and cities
 */
export const bulkUpdateMappings = async (req, res) => {
  try {
    const { productIds, cityIds, isAvailable = true, availabilityNotes = '' } = req.body;

    if (!Array.isArray(productIds) || !Array.isArray(cityIds) || productIds.length === 0 || cityIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'productIds and cityIds must be non-empty arrays',
      });
    }

    const bulkOps = [];
    for (const pId of productIds) {
      for (const cId of cityIds) {
        bulkOps.push({
          updateOne: {
            filter: { product: pId, city: cId },
            update: {
              $set: {
                isAvailable: Boolean(isAvailable),
                ...(availabilityNotes ? { availabilityNotes } : {}),
                updatedBy: req.user?._id,
              },
              $setOnInsert: {
                createdBy: req.user?._id,
              },
            },
            upsert: true,
          },
        });
      }
    }

    const result = await ProductCityMapping.bulkWrite(bulkOps);

    await logAudit({
      req,
      action: 'MAPPING_BULK_UPDATE',
      entityType: 'ProductCityMapping',
      details: `Bulk updated ${bulkOps.length} mappings (Set isAvailable=${isAvailable}) for ${productIds.length} products across ${cityIds.length} cities`,
    });

    purgeAllCache('Bulk product-city mapping update');

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${bulkOps.length} product-city mapping relations.`,
      result: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/product-city-mappings/:id
 * Remove a mapping completely
 */
export const deleteMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await ProductCityMapping.findByIdAndDelete(id);

    if (!mapping) {
      return res.status(404).json({ success: false, message: 'Mapping not found' });
    }

    await logAudit({
      req,
      action: 'MAPPING_DELETE',
      entityType: 'ProductCityMapping',
      entityId: id,
      details: `Deleted product-city mapping (${id})`,
    });

    purgeAllCache('ProductCityMapping deleted');

    return res.status(200).json({ success: true, message: 'Mapping removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
