import { Router } from 'express';
import {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  getRequestById,
  updateRequestStatus,
} from '../controllers/requests.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, (req, res, next) => {
  if (req.user.role === 'provider') {
    return getReceivedRequests(req, res, next);
  }
  return getMyRequests(req, res, next);
});
router.get('/:id', protect, getRequestById);
router.post('/', protect, authorize('customer'), createRequest);
router.put('/:id/status', protect, updateRequestStatus);

export default router;
