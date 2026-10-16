import mongoose from 'mongoose';

const homepageContentSchema = new mongoose.Schema(
  {
    hero: {
      eyebrow: { type: String, default: 'Atelier Industrial Racking & Shelving' },
      headline: { type: String, default: 'Smart Storage.' },
      italicHeadline: { type: String, default: 'Exceptional Spaces.' },
      subtitle: {
        type: String,
        default: 'Discover intelligently designed storage, shelving and display systems that bring strength, efficiency and order to modern retail spaces and industrial warehouses.',
      },
      primaryCtaText: { type: String, default: 'Request a Quote' },
      secondaryCtaText: { type: String, default: 'Explore Products' },
      image: { type: String, default: '/images/banner3.jpeg' },
    },
    about: {
      eyebrow: { type: String, default: 'About RP Storage Solution' },
      headline: { type: String, default: 'Built with Precision.' },
      italicHeadline: { type: String, default: 'Designed for Possibilities.' },
      paragraph1: {
        type: String,
        default: 'At RP Storage Solution, we view our clients as long-term partners, building business relationships founded on structural reliability, precision fabrication, and mutual growth. Based in New Delhi, India, we have established ourselves as one of the country\'s most dependable manufacturers and suppliers of retail and industrial storage systems.',
      },
      paragraph2: {
        type: String,
        default: 'With over three decades of practical engineering expertise, we understand the distinct spatial demands of modern retail stores, supermarkets, and high-throughput distribution warehouses. Our dedicated design team customizes each racking assembly to maximize vertical footprint and optimize workflow efficiency.',
      },
      image: { type: String, default: '/images/4605.jpg' },
    },
    areasWeServe: {
      isEnabled: { type: Boolean, default: true },
      heading: { type: String, default: 'Verified Distribution & Service Coverage' },
      italicHeading: { type: String, default: 'Across Delhi NCR & Key Industrial Corridors.' },
      subtitle: {
        type: String,
        default: 'Direct factory delivery, technical spatial surveys, and turnkey on-site assembly across certified regional commercial centers.',
      },
      selectedCities: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'City',
        },
      ],
      displayMode: {
        type: String,
        enum: ['cards', 'grid', 'list'],
        default: 'cards',
      },
      ctaText: { type: String, default: 'Explore All Delivery Locations' },
    },
    metrics: [
      {
        value: { type: Number, required: true },
        suffix: { type: String, default: '+' },
        label: { type: String, required: true },
        description: { type: String, default: '' },
      },
    ],
    seo: {
      title: {
        type: String,
        default: 'RP Storage Solution | Premier Supermarket Racks & Industrial Storage Systems',
      },
      description: {
        type: String,
        default: 'RP Storage Solution is India\'s premier manufacturer and exporter of heavy-duty supermarket racks, retail display systems, warehouse storage shelving, shopping trolleys, and cash counters.',
      },
      keywords: {
        type: String,
        default: 'Supermarket Racks Delhi, Retail Display Racks India, Warehouse Racking Systems, Industrial Storage Racks, Shopping Trolleys Manufacturer',
      },
      canonicalUrl: {
        type: String,
        default: 'https://www.rpstoragesolution.com/',
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  { timestamps: true }
);

export const HomepageContent = mongoose.model('HomepageContent', homepageContentSchema);
