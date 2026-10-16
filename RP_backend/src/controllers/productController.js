import slugify from 'slugify';
import { Product } from '../models/Product.js';
import { CityProduct } from '../models/CityProduct.js';
import { logAudit } from '../utils/audit.js';
import { invalidateProductCache } from '../services/cacheManager.js';

// GET all products with filtering, search, pagination
export const getProducts = async (req, res) => {
  try {
    const { search, category, status, isFeatured, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { shortDesc: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(parseInt(limit, 10)).lean(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      products,
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

// GET single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      category,
      categoryTitle,
      shortDesc,
      detailedDesc = '',
      images = [],
      specs = {},
      features = [],
      applications = [],
      highlights = [],
      material = 'Prime Grade CRCA Steel',
      dimensions = '',
      customizationOptions = '',
      isFeatured = false,
      isActive = true,
      seoTitle = '',
      metaDescription = '',
      canonicalUrl = '',
      faqs = [],
      status = 'published',
    } = req.body;

    if (!name || !category || !shortDesc) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, and short description are required.',
      });
    }

    const normalizedSlug = (customSlug || slugify(name, { lower: true, strict: true })).toLowerCase().trim();

    const existing = await Product.findOne({ slug: normalizedSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Product with slug '${normalizedSlug}' already exists.`,
      });
    }

    const finalCanonical = canonicalUrl || `https://www.rpstoragesolution.com/products/${normalizedSlug}/`;
    const finalSeoTitle = seoTitle || `${name} Manufacturer & Supplier | RP Storage Solution`;
    const finalMetaDesc =
      metaDescription ||
      `Buy heavy-duty ${name} from RP Storage Solution. Engineered for maximum load capacity, powder-coated durability, and custom dimensions. Direct factory pricing.`;

    const product = await Product.create({
      name: name.trim(),
      slug: normalizedSlug,
      category,
      categoryTitle: categoryTitle || category,
      shortDesc,
      detailedDesc,
      images,
      specs,
      features,
      applications,
      highlights,
      material,
      dimensions,
      customizationOptions,
      isFeatured,
      isActive,
      seoTitle: finalSeoTitle,
      metaDescription: finalMetaDesc,
      canonicalUrl: finalCanonical,
      faqs,
      status,
      publishedAt: status === 'published' ? new Date() : null,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'CREATE_PRODUCT',
      entityType: 'Product',
      entityId: product._id,
      details: `Created product '${product.name}'`,
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updates = { ...req.body, updatedBy: req.user._id };

    if (updates.slug && updates.slug !== product.slug) {
      const normalizedSlug = slugify(updates.slug, { lower: true, strict: true });
      const duplicate = await Product.findOne({ slug: normalizedSlug, _id: { $ne: product._id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Slug '${normalizedSlug}' is already in use by another product.`,
        });
      }
      updates.slug = normalizedSlug;
    }

    Object.assign(product, updates);
    await product.save();

    await logAudit({
      req,
      action: 'UPDATE_PRODUCT',
      entityType: 'Product',
      entityId: product._id,
      details: `Updated product '${product.name}'`,
    });

    invalidateProductCache(product.slug, `Product '${product.name}' updated`);

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DUPLICATE PRODUCT AS DRAFT
export const duplicateProduct = async (req, res) => {
  try {
    const original = await Product.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Original product not found' });

    const newName = `${original.name} (Copy)`;
    let newSlug = slugify(newName, { lower: true, strict: true });
    
    // ensure unique slug
    let counter = 1;
    while (await Product.findOne({ slug: newSlug })) {
      newSlug = `${slugify(original.name, { lower: true, strict: true })}-copy-${counter++}`;
    }

    const copyData = original.toObject();
    delete copyData._id;
    delete copyData.createdAt;
    delete copyData.updatedAt;

    copyData.name = newName;
    copyData.slug = newSlug;
    copyData.status = 'draft';
    copyData.isFeatured = false;
    copyData.createdBy = req.user._id;
    copyData.updatedBy = req.user._id;

    const newProduct = await Product.create(copyData);

    await logAudit({
      req,
      action: 'DUPLICATE_PRODUCT',
      entityType: 'Product',
      entityId: newProduct._id,
      details: `Duplicated product '${original.name}' as '${newProduct.name}'`,
    });

    return res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE PRODUCT SAFELY
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const dependentCount = await CityProduct.countDocuments({ product: product._id });
    if (dependentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete '${product.name}' because ${dependentCount} city-product SEO landing page(s) link to it.`,
      });
    }

    await product.deleteOne();

    await logAudit({
      req,
      action: 'DELETE_PRODUCT',
      entityType: 'Product',
      entityId: req.params.id,
      details: `Deleted product '${product.name}'`,
    });

    invalidateProductCache(product.slug, `Product '${product.name}' deleted`);

    return res.status(200).json({ success: true, message: `Product '${product.name}' deleted successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
