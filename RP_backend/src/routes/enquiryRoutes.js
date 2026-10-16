import express from 'express';
import {
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  exportEnquiriesCSV,
} from '../controllers/enquiryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getEnquiries);
router.get('/export/csv', authorize('super_admin', 'seo_manager'), exportEnquiriesCSV);
router.get('/:id', getEnquiryById);
router.patch('/:id', authorize('super_admin', 'seo_manager', 'content_editor'), updateEnquiry);

export default router;
