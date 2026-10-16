import express from 'express';
import { getHomepageContent, updateHomepageContent } from '../controllers/homepageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getHomepageContent);
router.put('/', authorize('super_admin', 'seo_manager', 'content_editor'), updateHomepageContent);

export default router;
