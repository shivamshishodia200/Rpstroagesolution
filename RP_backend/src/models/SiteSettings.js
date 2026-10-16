import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'RP Storage Solution' },
    companyName: { type: String, default: 'RP Storage Solution' },
    contactPhone: { type: String, default: '+91-9990023436' },
    phoneDisplay: { type: String, default: '+91 99900 23436' },
    phoneSecondary: { type: String, default: '+91-8851254937' },
    contactEmail: { type: String, default: 'rpstoragesolution12@gmail.com' },
    whatsappNumber: { type: String, default: '+919990023436' },
    address: {
      type: String,
      default: 'Plot At, Kh No. 13/7, Village Nangali Sakrawati, Najafgarh, New Delhi - 110043, India',
    },
    workingHours: { type: String, default: 'Monday – Saturday: 9:00 AM – 7:00 PM IST' },
    logoUrl: { type: String, default: '/images/logo.png' },
    faviconUrl: { type: String, default: '/images/logorp.png' },
    sitemapEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
