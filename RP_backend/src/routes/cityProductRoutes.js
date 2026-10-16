import express from 'express';
import {
  getCityProducts,
  getCityProductById,
  createCityProduct,
  updateCityProduct,
  submitForReview,
  approveCityProduct,
  requestChanges,
  publishCityProduct,
  unpublishCityProduct,
  getPageRevisions,
  restorePageRevision,
  getCityProductPreview,
  auditCityProductQuality,
  deleteCityProduct,
} from '../controllers/cityProductController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Listing and details
router.get('/', getCityProducts);
router.get('/:id', getCityProductById);
router.get('/:id/audit', auditCityProductQuality);
router.get('/:id/preview', getCityProductPreview);

// Revision History
router.get('/:id/revisions', getPageRevisions);
router.post('/:id/revisions/:version/restore', authorize('super_admin', 'seo_manager'), restorePageRevision);

// CRUD
router.post('/', authorize('super_admin', 'seo_manager', 'content_editor'), createCityProduct);
router.patch('/:id', authorize('super_admin', 'seo_manager', 'content_editor'), updateCityProduct);
router.delete('/:id', authorize('super_admin'), deleteCityProduct);

// Workflow transitions & approvals
router.post('/:id/submit-review', authorize('super_admin', 'seo_manager', 'content_editor'), submitForReview);
router.post('/:id/approve', authorize('super_admin', 'seo_manager'), approveCityProduct);
router.post('/:id/request-changes', authorize('super_admin', 'seo_manager'), requestChanges);
router.post('/:id/publish', authorize('super_admin', 'seo_manager'), publishCityProduct);
router.post('/:id/unpublish', authorize('super_admin', 'seo_manager'), unpublishCityProduct);

export default router;
