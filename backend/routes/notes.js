import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/notes.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getNotes);
router.post('/', protect, createNote);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);

export default router;
