import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getCityHomepages,
  createCityHomepage,
  getCityHomepageById,
  updateCityHomepage,
  submitForReview,
  approveCityHomepage,
  requestChangesCityHomepage,
  publishCityHomepage,
  unpublishCityHomepage,
  getCityHomepagePreview,
  getCityHomepageRevisions,
  restoreCityHomepageRevision,
  getCommonContentImpactAnalysis,
  deleteCityHomepage,
} from '../controllers/cityHomepageController.js';

const router = express.Router();

router.use(protect);

// Impact Analysis
router.get('/impact-analysis', getCommonContentImpactAnalysis);

// Core CRUD
router.get('/', getCityHomepages);
router.post('/', authorize('super_admin', 'seo_manager', 'content_editor'), createCityHomepage);
router.get('/:id', getCityHomepageById);
router.patch('/:id', authorize('super_admin', 'seo_manager', 'content_editor'), updateCityHomepage);
router.delete('/:id', authorize('super_admin'), deleteCityHomepage);

// Workflow Actions
router.post('/:id/submit-review', submitForReview);
router.post('/:id/approve', authorize('super_admin', 'seo_manager'), approveCityHomepage);
router.post('/:id/request-changes', authorize('super_admin', 'seo_manager'), requestChangesCityHomepage);
router.post('/:id/publish', authorize('super_admin', 'seo_manager'), publishCityHomepage);
router.post('/:id/unpublish', authorize('super_admin', 'seo_manager'), unpublishCityHomepage);

// Preview & Revisions
router.get('/:id/preview', getCityHomepagePreview);
router.get('/:id/revisions', getCityHomepageRevisions);
router.post('/:id/revisions/:version/restore', authorize('super_admin', 'seo_manager'), restoreCityHomepageRevision);

export default router;
