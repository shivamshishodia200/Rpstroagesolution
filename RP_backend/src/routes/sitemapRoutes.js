import express from 'express';
import {
  getSitemapIndex,
  getMainSitemap,
  getProductsSitemap,
  getLocationsSitemap,
  getCityProductsSitemap,
  getSitemapStats,
  regenerateSitemaps,
} from '../controllers/sitemapController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public XML Sitemap Endpoints
router.get('/sitemap.xml', getSitemapIndex);
router.get('/sitemap-main.xml', getMainSitemap);
router.get('/sitemap-products.xml', getProductsSitemap);
router.get('/sitemap-locations.xml', getLocationsSitemap);
router.get('/sitemap-city-products.xml', getCityProductsSitemap);

// Admin Inspector Endpoints
router.get('/api/admin/sitemap/stats', protect, getSitemapStats);
router.post('/api/admin/sitemap/regenerate', protect, regenerateSitemaps);

export default router;
