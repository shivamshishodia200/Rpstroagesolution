/**
 * High-Performance SEO Page & Sitemap Cache Manager
 * Provides tag-based and route-specific cache invalidation for published content.
 * Guarantees immediate cache purging upon unpublication or updates.
 */

const pageCache = new Map();
const sitemapCache = new Map();

let stats = {
  hits: 0,
  misses: 0,
  purges: 0,
  lastPurge: new Date().toISOString(),
  lastPurgeReason: 'Server Start',
};

export const getPageCache = (key) => {
  if (pageCache.has(key)) {
    stats.hits++;
    return pageCache.get(key);
  }
  stats.misses++;
  return null;
};

export const setPageCache = (key, data, ttlSeconds = 86400) => {
  pageCache.set(key, {
    ...data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const getSitemapCache = (key) => {
  if (sitemapCache.has(key)) {
    return sitemapCache.get(key);
  }
  return null;
};

export const setSitemapCache = (key, xml, ttlSeconds = 3600) => {
  sitemapCache.set(key, {
    xml,
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

/**
 * Invalidate a specific page route
 */
export const invalidateRoute = (routePath, reason = 'Route Invalidation') => {
  const normalized = routePath.toLowerCase().replace(/\/$/, '') || '/';
  let removedCount = 0;

  for (const key of pageCache.keys()) {
    if (key === normalized || key.startsWith(`${normalized}/`)) {
      pageCache.delete(key);
      removedCount++;
    }
  }

  sitemapCache.clear();
  stats.purges++;
  stats.lastPurge = new Date().toISOString();
  stats.lastPurgeReason = `${reason} (Purged ${removedCount} page keys & sitemaps)`;
  console.log(`[Cache Manager] Purged route '${normalized}': ${reason}`);
};

/**
 * Invalidate all routes dependent on a specific City
 */
export const invalidateCityCache = (citySlug, reason = 'City Update') => {
  const prefix = `/locations/${citySlug.toLowerCase()}`;
  for (const key of pageCache.keys()) {
    if (key === '/locations' || key === prefix || key.startsWith(`${prefix}/`)) {
      pageCache.delete(key);
    }
  }
  sitemapCache.clear();
  stats.purges++;
  stats.lastPurge = new Date().toISOString();
  stats.lastPurgeReason = `City '${citySlug}': ${reason}`;
  console.log(`[Cache Manager] Purged city cache for '${citySlug}': ${reason}`);
};

/**
 * Invalidate all routes dependent on a specific Product
 */
export const invalidateProductCache = (productSlug, reason = 'Product Update') => {
  const normalizedSlug = productSlug.toLowerCase();
  for (const key of pageCache.keys()) {
    if (
      key === '/products' ||
      key === `/products/${normalizedSlug}` ||
      key.endsWith(`/${normalizedSlug}`)
    ) {
      pageCache.delete(key);
    }
  }
  sitemapCache.clear();
  stats.purges++;
  stats.lastPurge = new Date().toISOString();
  stats.lastPurgeReason = `Product '${productSlug}': ${reason}`;
  console.log(`[Cache Manager] Purged product cache for '${productSlug}': ${reason}`);
};

/**
 * Invalidate sitemap cache only
 */
export const invalidateSitemapCache = (reason = 'Sitemap Invalidation') => {
  sitemapCache.clear();
  stats.lastPurge = new Date().toISOString();
  stats.lastPurgeReason = reason;
  console.log(`[Cache Manager] Purged sitemap cache: ${reason}`);
};

/**
 * Full cache purge
 */
export const purgeAllCache = (reason = 'Manual Full Purge') => {
  const count = pageCache.size + sitemapCache.size;
  pageCache.clear();
  sitemapCache.clear();
  stats.purges++;
  stats.lastPurge = new Date().toISOString();
  stats.lastPurgeReason = `${reason} (${count} entries removed)`;
  console.log(`[Cache Manager] Full cache purge executed: ${reason}`);
};

/**
 * Cache diagnostics
 */
export const getCacheDiagnostics = () => {
  return {
    pageEntries: pageCache.size,
    sitemapEntries: sitemapCache.size,
    hits: stats.hits,
    misses: stats.misses,
    hitRatio: stats.hits + stats.misses > 0 ? (stats.hits / (stats.hits + stats.misses)).toFixed(3) : '0.000',
    totalPurges: stats.purges,
    lastPurge: stats.lastPurge,
    lastPurgeReason: stats.lastPurgeReason,
  };
};
