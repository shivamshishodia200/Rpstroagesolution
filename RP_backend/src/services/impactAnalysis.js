import { City } from '../models/City.js';
import { CityHomepage } from '../models/CityHomepage.js';

/**
 * Analyzes the propagation impact of updating a shared section in the common HomepageContent
 * across all verified city homepages.
 *
 * @param {string} sectionKey - The section key being updated (e.g. 'hero', 'about', 'featuredProducts', 'faqs')
 * @returns {Promise<Object>} Detailed breakdown of affected vs protected city pages
 */
export async function analyzeCommonContentImpact(sectionKey = 'all') {
  const verifiedCities = await City.find({ isVerified: true, status: 'published' })
    .select('_id name slug state')
    .lean();

  const cityHomepages = await CityHomepage.find({
    city: { $in: verifiedCities.map((c) => c._id) },
  }).lean();

  const cityHomepageMap = {};
  for (const ch of cityHomepages) {
    cityHomepageMap[ch.city.toString()] = ch;
  }

  const sectionsToCheck = sectionKey === 'all'
    ? ['hero', 'trustStrip', 'about', 'featuredProducts', 'industries', 'statistics', 'benefits', 'projects', 'testimonials', 'faqs', 'enquiryCta']
    : [sectionKey];

  const impactBySection = {};

  for (const sec of sectionsToCheck) {
    const inheriting = [];
    const overridden = [];
    const hidden = [];

    for (const city of verifiedCities) {
      const ch = cityHomepageMap[city._id.toString()];
      const citySummary = {
        _id: city._id,
        name: city.name,
        slug: city.slug,
        state: city.state,
        hasConfig: Boolean(ch),
      };

      if (!ch) {
        // No custom override record created -> strictly inherits common content
        inheriting.push(citySummary);
      } else {
        const secConfig = ch[sec];
        const mode = secConfig?.mode || 'INHERIT';

        if (mode === 'HIDE') {
          hidden.push(citySummary);
        } else if (mode === 'OVERRIDE' || mode === 'REPLACE') {
          overridden.push(citySummary);
        } else {
          // 'INHERIT' or 'APPEND'
          inheriting.push(citySummary);
        }
      }
    }

    impactBySection[sec] = {
      section: sec,
      totalVerifiedCities: verifiedCities.length,
      affectedCount: inheriting.length,
      protectedCount: overridden.length,
      hiddenCount: hidden.length,
      inheritingCities: inheriting,
      overriddenCities: overridden,
      hiddenCities: hidden,
    };
  }

  const primarySection = sectionKey !== 'all' && impactBySection[sectionKey] ? impactBySection[sectionKey] : (impactBySection.hero || Object.values(impactBySection)[0] || {});

  const impact = {
    section: sectionKey,
    totalVerifiedCities: verifiedCities.length,
    affectedCount: primarySection.affectedCount ?? verifiedCities.length,
    protectedCount: primarySection.protectedCount ?? 0,
    hiddenCount: primarySection.hiddenCount ?? 0,
    affectedCities: primarySection.inheritingCities || [],
    protectedCities: primarySection.overriddenCities || [],
    hiddenCities: primarySection.hiddenCities || [],
  };

  return {
    totalCities: verifiedCities.length,
    impact,
    impactBySection,
    timestamp: new Date(),
  };
}
