import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  getAuditLogs,
  getSettings,
  updateSettings,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/users', authorize('super_admin'), getUsers);
router.post('/users', authorize('super_admin'), createUser);
router.patch('/users/:id', authorize('super_admin'), updateUser);

router.get('/audit-logs', authorize('super_admin', 'seo_manager'), getAuditLogs);
router.get('/settings', getSettings);
router.put('/settings', authorize('super_admin'), updateSettings);

export default router;
