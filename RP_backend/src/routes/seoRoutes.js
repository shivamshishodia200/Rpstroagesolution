import express from 'express';
import {
  getSeoAudit,
  getCacheStatus,
  clearSeoCache,
  getRedirects,
  createRedirect,
  deleteRedirect,
} from '../controllers/seoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/audit', getSeoAudit);
router.get('/cache-status', getCacheStatus);
router.post('/clear-cache', clearSeoCache);

router.get('/redirects', getRedirects);
router.post('/redirects', createRedirect);
router.delete('/redirects/:id', deleteRedirect);

export default router;
