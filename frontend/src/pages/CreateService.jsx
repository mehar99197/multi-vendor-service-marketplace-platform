import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { uploadImage } from '../api/upload';
import AuthContext from '../context/AuthContext';

const categories = [
  'Web Development',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Logo Design',
  'Social Media Management',
];

export default function CreateService() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deliveryTime: '',
  });
  const [images, setImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageUploading(true);
    setError('');
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f, 'services')));
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description || !form.category || !form.price || !form.deliveryTime) {
      setError('All fields are required.');
      return;
    }
    if (Number(form.price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }
    if (Number(form.deliveryTime) <= 0) {
      setError('Delivery time must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/services', {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        deliveryTime: Number(form.deliveryTime),
        images,
      });
      navigate('/dashboard/provider');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold">Create Service</h1>
        <p className="mt-1 text-gray-400">List your new service on the marketplace.</p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Modern React Website Development"
              className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your service in detail..."
              className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">Price ($)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Delivery Time (days)</label>
              <input
                type="number"
                name="deliveryTime"
                value={form.deliveryTime}
                onChange={handleChange}
                placeholder="7"
                min="1"
                className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Images (optional)</label>
            <div className="mt-1.5 flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover border border-gray-700" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-red-600 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-600 text-center text-xs text-gray-400 hover:border-blue-500">
                {imageUploading ? 'Uploading...' : '+ Add'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || imageUploading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Service'}
          </button>
        </form>
      </div>
    </div>
  );
}
