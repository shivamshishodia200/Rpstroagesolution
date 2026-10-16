import mongoose from 'mongoose';

const faqItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
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
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    stateRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      index: true,
    },
    serviceAvailability: {
      type: String,
      enum: ['verified', 'pending_verification', 'unavailable'],
      default: 'pending_verification',
      required: true,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    featuredImage: {
      type: String,
      default: '/images/banner3.jpeg',
    },
    imageAlt: {
      type: String,
      default: 'RP Storage Solution Industrial Racks Installation',
    },
    description: {
      type: String,
      default: '',
    },
    localRelevance: {
      type: String,
      default: '', // Key local commercial/industrial hubs e.g. Okhla, Sector 63, etc.
    },
    h1Heading: {
      type: String,
      default: '',
    },
    introContent: {
      type: String,
      default: '',
    },
    serviceDetails: {
      type: String,
      default: '',
    },
    faqs: [faqItemSchema],
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
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
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

citySchema.index({ slug: 1, status: 1 });

export const City = mongoose.model('City', citySchema);
