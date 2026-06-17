import { Router } from 'express';
import {
  getUsers,
  getUserStats,
  getServiceStats,
  getRequestStats,
  getProjectStats,
  getDashboardStats,
} from '../controllers/admin.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.get('/stats', getDashboardStats);
router.get('/user-stats', getUserStats);
router.get('/service-stats', getServiceStats);
router.get('/request-stats', getRequestStats);
router.get('/project-stats', getProjectStats);

export default router;
