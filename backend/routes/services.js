import { Router } from 'express';
import {
  getAllServices,
  getMyServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllServices);
router.get('/my', protect, authorize('provider'), getMyServices);
router.get('/:id', getServiceById);
router.post('/', protect, authorize('provider'), createService);
router.put('/:id', protect, authorize('provider'), updateService);
router.delete('/:id', protect, authorize('provider'), deleteService);

export default router;
