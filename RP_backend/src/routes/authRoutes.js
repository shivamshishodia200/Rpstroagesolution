import express from 'express';
import { login, getMe, logout, getDashboardStats } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/dashboard-stats', protect, getDashboardStats);

export default router;
