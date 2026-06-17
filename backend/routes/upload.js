import { Router } from 'express';
import { uploadImage } from '../controllers/upload.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// POST /api/upload?folder=avatars  — multipart/form-data, field name "image"
router.post('/', protect, upload.single('image'), uploadImage);

export default router;
