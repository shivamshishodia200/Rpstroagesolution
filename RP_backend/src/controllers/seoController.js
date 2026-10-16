import { City } from '../models/City.js';
import { Product } from '../models/Product.js';
import { CityProduct } from '../models/CityProduct.js';
import { HomepageContent } from '../models/HomepageContent.js';
import { Redirect } from '../models/Redirect.js';
import { getCacheDiagnostics, purgeAllCache } from '../services/cacheManager.js';

export const getSeoAudit = async (req, res) => {
  try {
    const [cities, products, cityProducts, homepage] = await Promise.all([
      City.find().select('name slug seoTitle metaDescription h1Heading canonicalUrl status isVerified').lean(),
      Product.find().select('name slug seoTitle metaDescription canonicalUrl status').lean(),
      CityProduct.find().select('slug cityName productName seoTitle metaDescription h1Heading canonicalUrl status customContent').lean(),
      HomepageContent.findOne().select('seo').lean(),
    ]);

    const issues = [];

    // Audit Cities
    cities.forEach((c) => {
      if (c.status === 'published') {
        if (!c.seoTitle || c.seoTitle.length < 20) {
          issues.push({ type: 'warning', page: `/locations/${c.slug}/`, field: 'SEO Title', message: 'Title is missing or too short (under 20 chars).' });
        }
        if (!c.metaDescription || c.metaDescription.length < 50) {
          issues.push({ type: 'warning', page: `/locations/${c.slug}/`, field: 'Meta Description', message: 'Meta description is missing or too short (under 50 chars).' });
        }
        if (!c.h1Heading) {
          issues.push({ type: 'error', page: `/locations/${c.slug}/`, field: 'H1 Heading', message: 'Missing primary H1 heading.' });
        }
        if (!c.isVerified) {
          issues.push({ type: 'error', page: `/locations/${c.slug}/`, field: 'Verification', message: 'City is published but marked as unverified.' });
        }
      }
    });

    // Audit Products
    products.forEach((p) => {
      if (p.status === 'published') {
        if (!p.seoTitle) {
          issues.push({ type: 'warning', page: `/products/${p.slug}/`, field: 'SEO Title', message: 'Product missing custom SEO title.' });
        }
        if (!p.metaDescription) {
          issues.push({ type: 'warning', page: `/products/${p.slug}/`, field: 'Meta Description', message: 'Product missing meta description.' });
        }
      }
    });

    // Audit CityProducts
    cityProducts.forEach((cp) => {
      if (cp.status === 'published') {
        if (!cp.customContent || cp.customContent.length < 100) {
          issues.push({ type: 'error', page: `/locations/${cp.slug}/`, field: 'Thin Content', message: 'Content is under 100 characters. Substantive local value-add required.' });
        }
        if (!cp.seoTitle) {
          issues.push({ type: 'warning', page: `/locations/${cp.slug}/`, field: 'SEO Title', message: 'Missing SEO Title.' });
        }
      }
    });

    // Check duplicate canonicals
    const canonicalMap = {};
    [...cities, ...products, ...cityProducts].forEach((item) => {
      if (item.canonicalUrl) {
        if (canonicalMap[item.canonicalUrl]) {
          canonicalMap[item.canonicalUrl].push(item.slug || item.name);
        } else {
          canonicalMap[item.canonicalUrl] = [item.slug || item.name];
        }
      }
    });

    Object.entries(canonicalMap).forEach(([canonical, slugs]) => {
      if (slugs.length > 1) {
        issues.push({
          type: 'error',
          page: slugs.join(', '),
          field: 'Duplicate Canonical',
          message: `Identical canonical URL '${canonical}' used across multiple pages.`,
        });
      }
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalIndexedPages:
          cities.filter((c) => c.status === 'published').length +
          products.filter((p) => p.status === 'published').length +
          cityProducts.filter((cp) => cp.status === 'published').length +
          1, // Homepage
        totalIssues: issues.length,
        errors: issues.filter((i) => i.type === 'error').length,
        warnings: issues.filter((i) => i.type === 'warning').length,
      },
      issues,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCacheStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    cache: getCacheDiagnostics(),
  });
};

export const clearSeoCache = (req, res) => {
  purgeAllCache(req.body.reason || `Admin manual cache purge by ${req.user?.email || 'admin'}`);
  return res.status(200).json({
    success: true,
    message: 'All SEO page and sitemap caches have been successfully purged.',
    diagnostics: getCacheDiagnostics(),
  });
};

export const getRedirects = async (req, res) => {
  try {
    const redirects = await Redirect.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, redirects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createRedirect = async (req, res) => {
  try {
    const { sourcePath, targetPath, statusCode = 301, isActive = true } = req.body;
    const redirect = await Redirect.create({
      sourcePath,
      targetPath,
      statusCode,
      isActive,
    });
    return res.status(201).json({ success: true, redirect });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRedirect = async (req, res) => {
  try {
    await Redirect.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Redirect deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
