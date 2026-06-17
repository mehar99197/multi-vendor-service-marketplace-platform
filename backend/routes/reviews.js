import { Router } from 'express';
import {
  createReview,
  getProviderReviews,
  getMyReviews,
} from '../controllers/reviews.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/provider/:providerId', getProviderReviews);
router.get('/my', protect, getMyReviews);
router.post('/', protect, authorize('customer'), createReview);

export default router;
