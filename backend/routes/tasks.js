import { Router } from 'express';
import { getMyTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getMyTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

export default router;
