import { Router } from 'express';
import {
  getMyProjects,
  getProjectById,
  updateProjectStatus,
  addProjectUpdate,
} from '../controllers/projects.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getMyProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id/status', protect, updateProjectStatus);
router.post('/:id/updates', protect, addProjectUpdate);

export default router;
