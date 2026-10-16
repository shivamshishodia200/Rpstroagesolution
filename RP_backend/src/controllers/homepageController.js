import { HomepageContent } from '../models/HomepageContent.js';
import { City } from '../models/City.js';
import { logAudit } from '../utils/audit.js';

// GET homepage CMS configuration
export const getHomepageContent = async (req, res) => {
  try {
    let content = await HomepageContent.findOne().populate({
      path: 'areasWeServe.selectedCities',
      select: 'name slug state isVerified serviceAvailability featuredImage description',
    });

    if (!content) {
      // Seed default if not yet created
      const verifiedCities = await City.find({ isVerified: true, status: 'published' }).limit(6);
      content = await HomepageContent.create({
        areasWeServe: {
          isEnabled: true,
          selectedCities: verifiedCities.map((c) => c._id),
        },
      });
    }

    return res.status(200).json({ success: true, homepage: content });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE homepage CMS configuration
export const updateHomepageContent = async (req, res) => {
  try {
    let content = await HomepageContent.findOne();
    if (!content) {
      content = new HomepageContent();
    }

    const { hero, about, areasWeServe, metrics, seo } = req.body;

    if (hero) content.hero = { ...content.hero, ...hero };
    if (about) content.about = { ...content.about, ...about };
    if (areasWeServe) {
      // Validate that selected cities exist
      content.areasWeServe = {
        ...content.areasWeServe,
        ...areasWeServe,
      };
    }
    if (metrics) content.metrics = metrics;
    if (seo) content.seo = { ...content.seo, ...seo };

    content.updatedBy = req.user._id;
    await content.save();

    await logAudit({
      req,
      action: 'UPDATE_HOMEPAGE_CMS',
      entityType: 'HomepageContent',
      entityId: content._id,
      details: 'Updated Homepage CMS settings & Areas We Serve configuration',
    });

    const populated = await HomepageContent.findById(content._id).populate({
      path: 'areasWeServe.selectedCities',
      select: 'name slug state isVerified serviceAvailability featuredImage description',
    });

    return res.status(200).json({ success: true, homepage: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
