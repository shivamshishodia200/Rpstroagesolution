import express from 'express';
import { uploadMiddleware, uploadMedia, getMediaList, deleteMedia } from '../controllers/mediaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMediaList);
router.post('/upload', authorize('super_admin', 'seo_manager', 'content_editor'), uploadMiddleware.single('image'), uploadMedia);
router.delete('/:id', authorize('super_admin', 'seo_manager'), deleteMedia);

export default router;
