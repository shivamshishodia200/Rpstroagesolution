import express from 'express';
import {
  getMappings,
  getMappingMatrix,
  createOrUpdateMapping,
  bulkUpdateMappings,
  deleteMapping,
} from '../controllers/productCityMappingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMappings);
router.get('/matrix', getMappingMatrix);
router.post('/', authorize('super_admin', 'seo_manager'), createOrUpdateMapping);
router.post('/bulk', authorize('super_admin', 'seo_manager'), bulkUpdateMappings);
router.delete('/:id', authorize('super_admin'), deleteMapping);

export default router;
