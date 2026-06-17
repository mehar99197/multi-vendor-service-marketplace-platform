import { Router } from 'express';
import {
  getAllProviders,
  getProviderById,
  updateProviderProfile,
  addPortfolioItem,
  deletePortfolioItem,
  getProviderStats,
} from '../controllers/providers.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllProviders);
router.get('/stats', protect, authorize('provider'), getProviderStats);
router.get('/:id', getProviderById);
router.put('/profile', protect, authorize('provider'), updateProviderProfile);
router.post('/portfolio', protect, authorize('provider'), addPortfolioItem);
router.delete('/portfolio/:itemId', protect, authorize('provider'), deletePortfolioItem);

export default router;
