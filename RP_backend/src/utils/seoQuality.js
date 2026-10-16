/**
 * Comprehensive Real-Time SEO Quality Evaluator
 * Identifies publishing blockers (critical integrity failures) and editorial warnings.
 */

export const evaluateSeoQuality = ({
  cityProduct = {},
  city = null,
  product = null,
  mapping = null,
}) => {
  const blockers = [];
  const warnings = [];

  // 1. Critical Availability & Mapping Blockers
  if (city && (!city.isVerified || city.status !== 'published')) {
    blockers.push(`Parent City '${city.name || 'Unknown'}' is not verified or not published.`);
  }

  if (product && (product.status !== 'published' || !product.isActive)) {
    blockers.push(`Parent Product '${product.name || 'Unknown'}' is unpublished or inactive.`);
  }

  if (!mapping || !mapping.isAvailable) {
    blockers.push('Product × City Availability Mapping is missing or disabled.');
  }

  // 2. Critical Content & Metadata Blockers
  const h1 = (cityProduct.h1Heading || '').trim();
  if (!h1) {
    blockers.push('Primary H1 Heading is missing.');
  }

  const seoTitle = (cityProduct.seoTitle || '').trim();
  if (!seoTitle) {
    blockers.push('SEO Meta Title is missing.');
  }

  const metaDesc = (cityProduct.metaDescription || '').trim();
  if (!metaDesc) {
    blockers.push('SEO Meta Description is missing.');
  }

  const rawContent = (cityProduct.customContent || '').replace(/<[^>]*>/g, ' ').trim();
  const wordCount = rawContent ? rawContent.split(/\s+/).filter(Boolean).length : 0;
  if (!rawContent) {
    blockers.push('Substantive City-Product custom content is required.');
  }

  const canonical = (cityProduct.canonicalUrl || '').trim();
  if (!canonical) {
    blockers.push('Canonical URL is missing.');
  } else if (!canonical.startsWith('http://') && !canonical.startsWith('https://')) {
    blockers.push('Canonical URL must be a valid absolute URL.');
  }

  // 3. Editorial & Best-Practice Warnings
  if (seoTitle) {
    if (seoTitle.length < 30) {
      warnings.push(`SEO Title is short (${seoTitle.length} chars). Target 45–60 characters.`);
    } else if (seoTitle.length > 70) {
      warnings.push(`SEO Title may be truncated in SERPs (${seoTitle.length} chars). Limit to ~60 characters.`);
    }
  }

  if (metaDesc) {
    if (metaDesc.length < 80) {
      warnings.push(`Meta Description is short (${metaDesc.length} chars). Target 120–160 characters.`);
    } else if (metaDesc.length > 170) {
      warnings.push(`Meta Description exceeds typical SERP snippet length (${metaDesc.length} chars).`);
    }
  }

  if (wordCount >= 30 && wordCount < 150) {
    warnings.push(`Content is relatively thin (${wordCount} words). Recommended: 200+ words of local value-add information.`);
  }

  // Images check
  const images = cityProduct.featuredImages || [];
  const missingAlt = images.filter((img) => !img.alt || img.alt.trim() === '');
  if (missingAlt.length > 0) {
    warnings.push(`${missingAlt.length} featured image(s) lack descriptive alt text.`);
  }

  // Internal links check
  const internalLinks = cityProduct.internalLinks || [];
  if (internalLinks.length === 0) {
    warnings.push('No contextual internal links configured. Consider linking to related city pages or parent categories.');
  }

  // Local details check
  const localInfo = cityProduct.localBusinessInfo || {};
  if (!localInfo.hubName && !localInfo.warehouseAddress) {
    warnings.push('Local business details (dispatch hub / address) are empty.');
  }

  // FAQs check
  const faqs = cityProduct.customFaqs || [];
  if (faqs.length === 0) {
    warnings.push('Custom FAQs are empty. Adding targeted local Q&As improves search snippets.');
  }

  // Calculate SEO Health Score (0 - 100)
  let score = 100;
  score -= blockers.length * 25;
  score -= warnings.length * 6;
  if (score < 0) score = 0;

  return {
    isPublishable: blockers.length === 0,
    blockers,
    warnings,
    wordCount,
    seoScore: Math.max(0, Math.min(100, Math.round(score))),
  };
};
