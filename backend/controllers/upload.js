import { uploadToCloudinary } from '../config/cloudinary.js';

// Streams a single buffered image to Cloudinary and returns its hosted URL.
// `folder` lets callers group uploads (e.g. avatars, services, portfolio).
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const folder = `teyzix/${req.query.folder || 'misc'}`;
    const url = await uploadToCloudinary(req.file.buffer, folder);

    res.status(201).json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
};

export { uploadImage };
