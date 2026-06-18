import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { uploadImage } from '../api/upload';
import AuthContext from '../context/AuthContext';
import { Reveal } from '../components/common/Motion';

const categories = [
  'Web Development',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Logo Design',
  'Social Media Management',
];

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deliveryTime: '',
  });
  const [images, setImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        const svc = res.data.service || res.data.data || res.data;

        if (user && svc.provider) {
          const providerId = svc.provider._id || svc.provider.id;
          if (user._id !== providerId) {
            setFetchError('You do not have permission to edit this service.');
            setLoading(false);
            return;
          }
        }

        setForm({
          title: svc.title || '',
          description: svc.description || '',
          category: svc.category || '',
          price: svc.price || '',
          deliveryTime: svc.deliveryTime || '',
        });
        setImages(svc.images || []);
      } catch {
        setFetchError('Service not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id, user]);

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

    setSaving(true);
    try {
      await api.put(`/services/${id}`, {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        deliveryTime: Number(form.deliveryTime),
        images,
      });
      navigate(`/services/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-white">
        <p className="text-xl text-red-400">{fetchError}</p>
        <Link to="/services" className="mt-4 text-indigo-400 hover:text-indigo-300">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Reveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient">Edit Service</h1>
            <p className="mt-1 text-gray-400">Update your service listing.</p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 transition-all hover:-translate-y-0.5">
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
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
                    min="0"
                    step="0.01"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Delivery Time (days)</label>
                  <input
                    type="number"
                    name="deliveryTime"
                    value={form.deliveryTime}
                    onChange={handleChange}
                    min="1"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Images (optional)</label>
                <div className="mt-1.5 flex flex-wrap gap-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover border border-white/10" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-red-600 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/15 text-center text-xs text-gray-400 transition hover:border-indigo-500 hover:text-indigo-300">
                    {imageUploading ? 'Uploading...' : '+ Add'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || imageUploading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60 glow-indigo"
              >
                {saving ? 'Saving...' : 'Update Service'}
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
