import { Product } from '../models/Product.js';
import { City } from '../models/City.js';
import { CityProduct } from '../models/CityProduct.js';
import { ProductCityMapping } from '../models/ProductCityMapping.js';
import { HomepageContent } from '../models/HomepageContent.js';
import { CityHomepage } from '../models/CityHomepage.js';
import {
  getSitemapCache,
  setSitemapCache,
  invalidateSitemapCache,
} from '../services/cacheManager.js';

const BASE_URL = process.env.BASE_URL || 'https://www.rpstoragesolution.com';

let lastSuccessfulGen = new Date().toISOString();
let lastGenError = null;

// GET /sitemap.xml (Sitemap Index)
export const getSitemapIndex = async (req, res) => {
  try {
    const cached = getSitemapCache('sitemap_index');
    if (cached) {
      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('X-Sitemap-Cache', 'HIT');
      return res.status(200).send(cached.xml);
    }

    const today = new Date().toISOString().slice(0, 10);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-main.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-products.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-locations.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-city-products.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

    setSitemapCache('sitemap_index', xml);
    lastSuccessfulGen = new Date().toISOString();
    lastGenError = null;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('X-Sitemap-Cache', 'MISS');
    return res.status(200).send(xml);
  } catch (error) {
    lastGenError = error.message;
    return res.status(500).send('Error generating sitemap index');
  }
};

// GET /sitemap-main.xml
export const getMainSitemap = async (req, res) => {
  try {
    const cached = getSitemapCache('sitemap_main');
    if (cached) {
      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('X-Sitemap-Cache', 'HIT');
      return res.status(200).send(cached.xml);
    }

    const homepage = await HomepageContent.findOne().lean();
    const lastMod = homepage?.updatedAt ? new Date(homepage.updatedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/locations</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/products</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    setSitemapCache('sitemap_main', xml);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('X-Sitemap-Cache', 'MISS');
    return res.status(200).send(xml);
  } catch (error) {
    lastGenError = error.message;
    return res.status(500).send('Error generating main sitemap');
  }
};

// GET /sitemap-products.xml
export const getProductsSitemap = async (req, res) => {
  try {
    const cached = getSitemapCache('sitemap_products');
    if (cached) {
      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('X-Sitemap-Cache', 'HIT');
      return res.status(200).send(cached.xml);
    }

    const products = await Product.find({ status: 'published', isActive: true })
      .select('slug updatedAt publishedAt')
      .lean();

    const urls = products
      .map((p) => {
        const lastMod = new Date(p.updatedAt || p.publishedAt || Date.now()).toISOString().slice(0, 10);
        return `  <url>
    <loc>${BASE_URL}/products/${p.slug}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    setSitemapCache('sitemap_products', xml);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('X-Sitemap-Cache', 'MISS');
    return res.status(200).send(xml);
  } catch (error) {
    lastGenError = error.message;
    return res.status(500).send('Error generating products sitemap');
  }
};

// GET /sitemap-locations.xml
export const getLocationsSitemap = async (req, res) => {
  try {
    const cached = getSitemapCache('sitemap_locations');
    if (cached) {
      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('X-Sitemap-Cache', 'HIT');
      return res.status(200).send(cached.xml);
    }

    const cities = await City.find({ status: 'published', isVerified: true })
      .select('_id slug updatedAt publishedAt')
      .lean();

    const cityIds = cities.map((c) => c._id);
    const homepages = await CityHomepage.find({ city: { $in: cityIds } }).lean();
    const homepageMap = new Map();
    for (const hp of homepages) {
      homepageMap.set(String(hp.city), hp);
    }

    const eligibleCities = cities.filter((c) => {
      const hp = homepageMap.get(String(c._id));
      if (!hp) return true; // Inherits published default homepage
      // Exclude if draft, unpublished, disabled, or marked noindex
      if (hp.status !== 'published' || hp.enabled === false) return false;
      if (hp.seo?.robotsDirective && hp.seo.robotsDirective.toLowerCase().includes('noindex')) return false;
      return true;
    });

    const urls = eligibleCities
      .map((c) => {
        const hp = homepageMap.get(String(c._id));
        const modDates = [c.updatedAt, c.publishedAt, hp?.updatedAt, hp?.publishedAt].filter(Boolean);
        const lastModDate = modDates.length > 0 ? new Date(Math.max(...modDates.map((d) => new Date(d).getTime()))) : new Date();
        const lastMod = lastModDate.toISOString().slice(0, 10);
        return `  <url>
    <loc>${BASE_URL}/locations/${c.slug}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    setSitemapCache('sitemap_locations', xml);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('X-Sitemap-Cache', 'MISS');
    return res.status(200).send(xml);
  } catch (error) {
    lastGenError = error.message;
    return res.status(500).send('Error generating locations sitemap');
  }
};

// GET /sitemap-city-products.xml
export const getCityProductsSitemap = async (req, res) => {
  try {
    const cached = getSitemapCache('sitemap_city_products');
    if (cached) {
      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('X-Sitemap-Cache', 'HIT');
      return res.status(200).send(cached.xml);
    }

    const cityProducts = await CityProduct.find({
      status: 'published',
      noIndex: { $ne: true },
    })
      .populate('city', 'status isVerified')
      .populate('product', 'status isActive')
      .select('city product slug updatedAt publishedAt noIndex')
      .lean();

    // Filter to strictly verified cities and active products
    const candidateCityProducts = cityProducts.filter(
      (cp) =>
        cp.city &&
        cp.city.status === 'published' &&
        cp.city.isVerified &&
        cp.product &&
        cp.product.status === 'published' &&
        cp.product.isActive
    );

    // Filter by active ProductCityMapping
    const activeMappings = await ProductCityMapping.find({
      isAvailable: true,
      city: { $in: candidateCityProducts.map((cp) => cp.city._id) },
      product: { $in: candidateCityProducts.map((cp) => cp.product._id) },
    }).lean();

    const activeMappingSet = new Set(
      activeMappings.map((m) => `${m.product.toString()}_${m.city.toString()}`)
    );

    const validCityProducts = candidateCityProducts.filter((cp) =>
      activeMappingSet.has(`${cp.product._id.toString()}_${cp.city._id.toString()}`)
    );

    const urls = validCityProducts
      .map((cp) => {
        const lastMod = new Date(cp.updatedAt || cp.publishedAt || Date.now()).toISOString().slice(0, 10);
        return `  <url>
    <loc>${BASE_URL}/locations/${cp.slug}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    setSitemapCache('sitemap_city_products', xml);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('X-Sitemap-Cache', 'MISS');
    return res.status(200).send(xml);
  } catch (error) {
    lastGenError = error.message;
    return res.status(500).send('Error generating city-products sitemap');
  }
};

// Admin overview of sitemaps with deep exclusion breakdown
export const getSitemapStats = async (req, res) => {
  try {
    const [
      publishedProducts,
      inactiveProducts,
      publishedCities,
      unverifiedCities,
      publishedCityProducts,
      draftCityProducts,
      noindexCityProducts,
    ] = await Promise.all([
      Product.countDocuments({ status: 'published', isActive: true }),
      Product.countDocuments({ $or: [{ status: { $ne: 'published' } }, { isActive: false }] }),
      City.countDocuments({ status: 'published', isVerified: true }),
      City.countDocuments({ $or: [{ status: { $ne: 'published' } }, { isVerified: false }] }),
      CityProduct.countDocuments({ status: 'published', noIndex: { $ne: true } }),
      CityProduct.countDocuments({ status: { $ne: 'published' } }),
      CityProduct.countDocuments({ noIndex: true }),
    ]);

    const totalIndexable = 3 + publishedProducts + publishedCities + publishedCityProducts; // 3 main: /, /products, /locations

    return res.status(200).json({
      success: true,
      stats: {
        indexUrl: `${BASE_URL}/sitemap.xml`,
        totalUrls: totalIndexable,
        breakdown: {
          main: 3,
          products: publishedProducts,
          locations: publishedCities,
          cityProducts: publishedCityProducts,
        },
        exclusions: {
          inactiveOrDraftProducts: inactiveProducts,
          unverifiedOrDraftCities: unverifiedCities,
          draftOrReviewCityProducts: draftCityProducts,
          noindexFlaggedCityProducts: noindexCityProducts,
        },
        lastSuccessfulGeneration: lastSuccessfulGen,
        generationErrorStatus: lastGenError || 'healthy',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin manual sitemap regeneration
export const regenerateSitemaps = async (req, res) => {
  try {
    invalidateSitemapCache(`Admin manual regeneration requested by ${req.user?.email || 'admin'}`);
    lastSuccessfulGen = new Date().toISOString();
    lastGenError = null;

    return res.status(200).json({
      success: true,
      message: 'Dynamic XML sitemaps regenerated and cache purged successfully.',
      timestamp: lastSuccessfulGen,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
