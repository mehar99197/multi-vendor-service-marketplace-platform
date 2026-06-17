import { uploadToCloudinary } from '../config/cloudinary.js';

// Only these logical buckets are allowed — never interpolate raw user input into the path.
const ALLOWED_FOLDERS = ['avatars', 'services', 'portfolio', 'misc'];

// Streams a single buffered image to Cloudinary and returns its hosted URL.
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const requested = req.query.folder;
    const sub = ALLOWED_FOLDERS.includes(requested) ? requested : 'misc';
    const url = await uploadToCloudinary(req.file.buffer, `teyzix/${sub}`);

    res.status(201).json({ url });
  } catch (error) {
    console.error('uploadImage error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

export { uploadImage };
