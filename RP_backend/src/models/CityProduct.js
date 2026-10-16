import mongoose from 'mongoose';

const faqItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const internalLinkSchema = new mongoose.Schema({
  anchorText: { type: String, required: true },
  targetUrl: { type: String, required: true },
});

const featuredImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  caption: { type: String, default: '' },
});

const cityProductSchema = new mongoose.Schema(
  {
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true,
    },
    citySlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    cityName: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // e.g. "delhi/supermarket-racks"
    },
    pageName: {
      type: String,
      default: '',
    },
    h1Heading: {
      type: String,
      required: true,
      trim: true,
    },
    introContent: {
      type: String,
      default: '',
    },
    customContent: {
      type: String,
      required: true, // Substantive local value-add rich text content
    },
    benefits: {
      type: [String],
      default: [],
    },
    applications: {
      type: [String],
      default: [],
    },
    serviceDetails: {
      type: String,
      default: '',
    },
    localBusinessInfo: {
      hubName: { type: String, default: '' },
      warehouseAddress: { type: String, default: '' },
      servicePhone: { type: String, default: '' },
      deliveryTimelines: { type: String, default: '' },
      verifiedServiceArea: { type: String, default: '' },
    },
    featuredImages: [featuredImageSchema],
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    relatedCities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
      },
    ],
    customFaqs: [faqItemSchema],
    customSpecs: {
      type: Map,
      of: String,
      default: {},
    },
    enquiryCta: {
      heading: { type: String, default: 'Request Factory Direct Technical Drawing & Pricing' },
      subheading: { type: String, default: 'Custom engineered storage systems with free on-site survey.' },
      buttonText: { type: String, default: 'Get Quotation' },
      phone: { type: String, default: '+91 99900 23436' },
    },

    // Technical SEO
    seoTitle: {
      type: String,
      required: true,
      trim: true,
    },
    metaDescription: {
      type: String,
      required: true,
      trim: true,
    },
    canonicalUrl: {
      type: String,
      default: '',
      trim: true,
    },
    robotsDirective: {
      type: String,
      enum: ['index, follow', 'noindex, nofollow', 'noindex, follow', 'index, nofollow'],
      default: 'index, follow',
    },
    ogTitle: {
      type: String,
      default: '',
      trim: true,
    },
    ogDescription: {
      type: String,
      default: '',
      trim: true,
    },
    ogImage: {
      type: String,
      default: '',
      trim: true,
    },
    schemaType: {
      type: String,
      default: 'Product',
    },
    internalLinks: [internalLinkSchema],

    // Workflow & Version Control
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'changes_requested', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    approvedAt: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
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

cityProductSchema.index({ city: 1, product: 1 }, { unique: true });

export const CityProduct = mongoose.model('CityProduct', cityProductSchema);
