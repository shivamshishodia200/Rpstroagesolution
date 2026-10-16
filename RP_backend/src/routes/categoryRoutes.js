import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public read access for categories
router.get('/public', getCategories);

// Protected admin routes
router.use(protect);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authorize('super_admin', 'seo_manager'), createCategory);
router.patch('/:id', authorize('super_admin', 'seo_manager'), updateCategory);
router.delete('/:id', authorize('super_admin'), deleteCategory);

export default router;
