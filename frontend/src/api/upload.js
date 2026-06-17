import api from './axios';

// Uploads a single image File to Cloudinary via the backend and returns the URL.
// `folder` groups uploads on Cloudinary (e.g. 'avatars', 'services', 'portfolio').
export async function uploadImage(file, folder = 'misc') {
  const formData = new FormData();
  formData.append('image', file);

  // Let axios/the browser set Content-Type so the multipart boundary is included.
  const res = await api.post(`/upload?folder=${encodeURIComponent(folder)}`, formData);

  return res.data.url;
}
