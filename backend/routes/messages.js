import { Router } from 'express';
import { getProjectMessages, sendMessage } from '../controllers/messages.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/project/:projectId', protect, getProjectMessages);
router.post('/', protect, sendMessage);

export default router;
