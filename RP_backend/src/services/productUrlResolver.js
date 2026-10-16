import { ProductCityMapping } from '../models/ProductCityMapping.js';
import { CityProduct } from '../models/CityProduct.js';

/**
 * Bulk resolves context-aware public URLs for a list of products.
 * Avoids N+1 queries by executing only 2 batch queries for the entire product list.
 *
 * Strict Rules:
 * - If no city, or city is unverified or unpublished -> master URL (/products/:productSlug/)
 * - If product is mapped & available in city, AND a published dedicated CityProduct SEO page exists -> /locations/:citySlug/:productSlug/
 * - If product is mapped & available, but NO dedicated CityProduct SEO page is published -> fallback to master URL (/products/:productSlug/)
 * - Never fabricates an unverified or unpublished city-product URL.
 *
 * @param {Array} products - List of Product documents/objects (must contain _id and slug)
 * @param {Object|null} city - Optional City document/object (with _id, slug, isVerified, status)
 * @returns {Promise<Array>} Products with resolved targetUrl, hasDedicatedSeoPage, isAvailableInCity
 */
export async function resolveProductUrlsBulk(products, city = null) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  // Helper to ensure clean URL formatting matching existing published conventions
  const formatMasterUrl = (slug) => {
    const clean = String(slug || '').replace(/^\/+|\/+$/g, '');
    return clean ? `/products/${clean}` : '/products';
  };

  const formatCityProductUrl = (seoSlug) => {
    const clean = String(seoSlug || '').replace(/^\/+|\/+$/g, '');
    return clean ? `/locations/${clean}` : '/locations';
  };

  // 1. If no city context, or city is unverified / unpublished, every product links to master URL
  const isCityValid =
    city &&
    city._id &&
    (city.status === undefined || city.status === 'published') &&
    (city.isVerified === undefined || city.isVerified === true);

  if (!isCityValid) {
    return products.map((p) => ({
      ...p,
      hasDedicatedSeoPage: false,
      isAvailableInCity: false,
      targetUrl: formatMasterUrl(p.slug),
    }));
  }

  const productIds = products.map((p) => p._id).filter(Boolean);
  if (productIds.length === 0) {
    return products.map((p) => ({
      ...p,
      hasDedicatedSeoPage: false,
      isAvailableInCity: false,
      targetUrl: formatMasterUrl(p.slug),
    }));
  }

  // 2. Batch query for active availability mappings (Avoid N+1)
  const mappings = await ProductCityMapping.find({
    city: city._id,
    product: { $in: productIds },
    isAvailable: true,
  })
    .select('product isAvailable')
    .lean();

  const mappedProductIds = new Set(mappings.map((m) => m.product.toString()));

  // 3. Batch query for published CityProduct SEO pages (Product._id + City._id)
  const cityProducts = await CityProduct.find({
    city: city._id,
    product: { $in: productIds },
    status: 'published',
  })
    .select('product slug productSlug status')
    .lean();

  const exactSeoMap = new Map();
  for (const cp of cityProducts) {
    if (cp.product) {
      exactSeoMap.set(cp.product.toString(), cp);
    }
  }

  // 4. Resolve each product URL strictly enforcing exact Product._id + City._id
  return products.map((prod) => {
    const prodIdStr = prod._id ? prod._id.toString() : '';
    const isMapped = mappedProductIds.has(prodIdStr);
    const seoRecord = exactSeoMap.get(prodIdStr);

    // Exact Product Identity & Eligibility Check:
    // A dedicated city-product SEO URL is valid ONLY when:
    // a) Product is actively mapped and available in this city (Product._id + City._id)
    // b) A published matching CityProduct SEO record exists
    // c) The SEO record's slug or productSlug matches the exact Product.slug (NOT a category slug)
    const expectedCityProductSlug = `${city.slug}/${prod.slug}`.toLowerCase();
    const isExactProductSeoMatch =
      Boolean(seoRecord) &&
      (seoRecord.slug?.toLowerCase() === expectedCityProductSlug ||
       seoRecord.productSlug?.toLowerCase() === prod.slug?.toLowerCase());

    const hasDedicated = Boolean(isMapped && isExactProductSeoMatch);

    // If dedicated page exists, resolve exact city-product URL: /locations/:citySlug/:productSlug
    // If not, cleanly fall back to master product URL: /products/:productSlug
    const targetUrl = hasDedicated
      ? formatCityProductUrl(seoRecord.slug || `${city.slug}/${prod.slug}`)
      : formatMasterUrl(prod.slug);

    return {
      ...prod,
      isAvailableInCity: isMapped,
      hasDedicatedSeoPage: hasDedicated,
      targetUrl,
    };
  });
}

/**
 * Single product URL resolver (delegates to bulk resolver)
 */
export async function resolveProductUrl(product, city = null) {
  if (!product) return '/products/';
  const [resolved] = await resolveProductUrlsBulk([product], city);
  return resolved?.targetUrl || `/products/${product.slug}/`;
}
