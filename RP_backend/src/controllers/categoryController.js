import slugify from 'slugify';
import { ProductCategory } from '../models/ProductCategory.js';
import { Product } from '../models/Product.js';
import { logAudit } from '../utils/audit.js';

export const getCategories = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const categories = await ProductCategory.find(filter).sort({ order: 1, name: 1 }).lean();
    return res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, order, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const categorySlug = (slug || slugify(name, { lower: true, strict: true })).toLowerCase().trim();

    const existing = await ProductCategory.findOne({
      $or: [{ slug: categorySlug }, { name: name.trim() }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name or slug already exists',
      });
    }

    const category = await ProductCategory.create({
      name: name.trim(),
      slug: categorySlug,
      description: description || '',
      image: image || '',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await logAudit({
      req,
      action: 'CATEGORY_CREATE',
      entityType: 'ProductCategory',
      entityId: category._id,
      details: `Created category '${category.name}' (${category.slug})`,
    });

    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, slug, description, image, order, isActive } = req.body;

    if (name) category.name = name.trim();
    if (slug) {
      const newSlug = slugify(slug, { lower: true, strict: true });
      const duplicate = await ProductCategory.findOne({ slug: newSlug, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Slug already taken by another category' });
      }
      category.slug = newSlug;
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (order !== undefined) category.order = Number(order);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    await logAudit({
      req,
      action: 'CATEGORY_UPDATE',
      entityType: 'ProductCategory',
      entityId: category._id,
      details: `Updated category '${category.name}'`,
    });

    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Safety check: Are any products using this category slug?
    const productsUsing = await Product.countDocuments({ category: category.slug });
    if (productsUsing > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${productsUsing} product(s) are actively assigned to it. Please reassign products first.`,
      });
    }

    await ProductCategory.findByIdAndDelete(id);

    await logAudit({
      req,
      action: 'CATEGORY_DELETE',
      entityType: 'ProductCategory',
      entityId: id,
      details: `Deleted category '${category.name}' (${category.slug})`,
    });

    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
