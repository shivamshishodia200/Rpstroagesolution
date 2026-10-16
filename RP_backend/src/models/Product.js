import mongoose from 'mongoose';

const productImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
});

const faqItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
      index: true,
    },
    categoryTitle: {
      type: String,
      default: '',
    },
    shortDesc: {
      type: String,
      required: true,
    },
    detailedDesc: {
      type: String,
      default: '',
    },
    images: [productImageSchema],
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    features: [{ type: String }],
    applications: [{ type: String }],
    highlights: [{ type: String }],
    material: {
      type: String,
      default: 'Prime Grade CRCA Steel',
    },
    dimensions: {
      type: String,
      default: '',
    },
    customizationOptions: {
      type: String,
      default: 'Available in custom bay widths, column heights, and shelf depths.',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    seoTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    canonicalUrl: {
      type: String,
      default: '',
    },
    faqs: [faqItemSchema],
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
