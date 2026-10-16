import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authorize('super_admin', 'seo_manager', 'content_editor'), createProduct);
router.patch('/:id', authorize('super_admin', 'seo_manager', 'content_editor'), updateProduct);
router.post('/:id/duplicate', authorize('super_admin', 'seo_manager', 'content_editor'), duplicateProduct);
router.delete('/:id', authorize('super_admin'), deleteProduct);

export default router;
