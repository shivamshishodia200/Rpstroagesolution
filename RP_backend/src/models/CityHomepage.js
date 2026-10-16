import mongoose from 'mongoose';

const faqItemSchema = new mongoose.Schema(
  {
    question: { type: String, default: '' },
    answer: { type: String, default: '' },
    q: { type: String, default: '' },
    a: { type: String, default: '' },
  },
  { _id: false }
);

const cityHomepageSchema = new mongoose.Schema(
  {
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City reference is required'],
      unique: true,
      index: true,
    },
    citySlug: {
      type: String,
      required: [true, 'City slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    cityName: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    stateName: {
      type: String,
      required: [true, 'State name is required'],
      trim: true,
    },
    inheritHomepage: {
      type: Boolean,
      default: true,
    },

    // 1. HERO SECTION OVERRIDE
    hero: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      eyebrow: { type: String, default: '' },
      headline: { type: String, default: '' },
      italicHeadline: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      primaryCtaText: { type: String, default: '' },
      secondaryCtaText: { type: String, default: '' },
      image: { type: String, default: '' },
    },

    // 2. TRUST STRIP OVERRIDE
    trustStrip: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      customBadges: [
        {
          icon: { type: String, default: '' },
          title: { type: String, default: '' },
          subtitle: { type: String, default: '' },
        },
      ],
    },

    // 3. ABOUT SECTION OVERRIDE
    about: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      eyebrow: { type: String, default: '' },
      headline: { type: String, default: '' },
      italicHeadline: { type: String, default: '' },
      paragraph1: { type: String, default: '' },
      paragraph2: { type: String, default: '' },
      localPresenceDetails: { type: String, default: '' },
      image: { type: String, default: '' },
    },

    // 4. FEATURED PRODUCTS OVERRIDE
    featuredProducts: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      filterMode: {
        type: String,
        enum: ['all_available', 'curated'],
        default: 'all_available',
      },
      selectedProductIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      heading: { type: String, default: '' },
      subtitle: { type: String, default: '' },
    },

    // 5. INDUSTRIES OVERRIDE
    industries: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      heading: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      localCaseNote: { type: String, default: '' },
    },

    // 6. STATISTICS OVERRIDE
    statistics: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      metrics: [
        {
          value: { type: Number, required: true },
          suffix: { type: String, default: '+' },
          label: { type: String, required: true },
          description: { type: String, default: '' },
        },
      ],
    },

    // 7. BENEFITS (WHY CHOOSE US) OVERRIDE
    benefits: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      heading: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      customItems: [
        {
          title: { type: String, required: true },
          description: { type: String, default: '' },
          icon: { type: String, default: '' },
        },
      ],
    },

    // 8. PROJECTS (INSTALLATION GALLERY) OVERRIDE
    projects: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      heading: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      localProjects: [
        {
          title: { type: String, required: true },
          location: { type: String, default: '' },
          client: { type: String, default: '' },
          image: { type: String, default: '' },
          rackType: { type: String, default: '' },
        },
      ],
    },

    // 9. TESTIMONIALS OVERRIDE
    testimonials: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      customItems: [
        {
          quote: { type: String, required: true },
          author: { type: String, default: '' },
          company: { type: String, default: '' },
          location: { type: String, default: '' },
          rating: { type: Number, default: 5 },
        },
      ],
    },

    // 10. FAQ OVERRIDE
    faqs: {
      mode: {
        type: String,
        enum: ['INHERIT', 'APPEND', 'REPLACE', 'HIDE'],
        default: 'INHERIT',
      },
      items: [faqItemSchema],
    },

    // 11. ENQUIRY CTA OVERRIDE
    enquiryCta: {
      mode: {
        type: String,
        enum: ['INHERIT', 'OVERRIDE', 'HIDE'],
        default: 'INHERIT',
      },
      heading: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      phone: { type: String, default: '' },
      buttonText: { type: String, default: '' },
    },

    // TECHNICAL SEO METADATA
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      h1: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
      robotsDirective: {
        type: String,
        enum: ['index, follow', 'noindex, nofollow', 'noindex, follow', 'index, nofollow'],
        default: 'index, follow',
      },
      ogTitle: { type: String, default: '' },
      ogDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },

    // EDITORIAL WORKFLOW & VERSION CONTROL
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'changes_requested', 'published', 'unpublished', 'archived'],
      default: 'draft',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewNotes: {
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cityHomepageSchema.virtual('sectionOverrides').get(function () {
  return {
    hero: this.hero,
    trustStrip: this.trustStrip,
    about: this.about,
    featuredProducts: this.featuredProducts,
    industries: this.industries,
    statistics: this.statistics,
    benefits: this.benefits,
    projects: this.projects,
    testimonials: this.testimonials,
    faqs: this.faqs,
    enquiryCta: this.enquiryCta,
  };
});

cityHomepageSchema.index({ citySlug: 1, status: 1 });
cityHomepageSchema.index({ city: 1, status: 1 });

export const CityHomepage = mongoose.model('CityHomepage', cityHomepageSchema);
