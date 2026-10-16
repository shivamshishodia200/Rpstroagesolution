import express from 'express';
import {
  getCities,
  getCityById,
  createCity,
  updateCity,
  submitCityForReview,
  approveCity,
  publishCity,
  unpublishCity,
  deleteCity,
} from '../controllers/cityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getCities);
router.get('/:id', getCityById);
router.post('/', authorize('super_admin', 'seo_manager', 'content_editor'), createCity);
router.patch('/:id', authorize('super_admin', 'seo_manager', 'content_editor'), updateCity);
router.post('/:id/submit-review', authorize('super_admin', 'seo_manager', 'content_editor'), submitCityForReview);
router.post('/:id/approve', authorize('super_admin', 'seo_manager'), approveCity);
router.post('/:id/publish', authorize('super_admin', 'seo_manager'), publishCity);
router.post('/:id/unpublish', authorize('super_admin', 'seo_manager'), unpublishCity);
router.delete('/:id', authorize('super_admin'), deleteCity);

export default router;
