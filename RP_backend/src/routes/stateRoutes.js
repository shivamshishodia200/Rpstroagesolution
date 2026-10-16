import express from 'express';
import {
  getStates,
  getStateById,
  createState,
  updateState,
  deleteState,
} from '../controllers/stateController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public read access for active states
router.get('/public', getStates);

// Protected admin routes
router.use(protect);
router.get('/', getStates);
router.get('/:id', getStateById);
router.post('/', authorize('super_admin', 'seo_manager'), createState);
router.patch('/:id', authorize('super_admin', 'seo_manager'), updateState);
router.delete('/:id', authorize('super_admin'), deleteState);

export default router;
