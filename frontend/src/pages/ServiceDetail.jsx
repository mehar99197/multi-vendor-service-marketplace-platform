import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const svcRes = await api.get(`/services/${id}`);
        const svc = svcRes.data.service || svcRes.data.data || svcRes.data;
        setService(svc);

        if (svc.provider?._id || svc.provider?.id) {
          const providerId = svc.provider._id || svc.provider.id;
          try {
            const revRes = await api.get(`/reviews/provider/${providerId}`);
            // The endpoint returns a bare array; tolerate a wrapped shape too.
            setReviews(
              Array.isArray(revRes.data) ? revRes.data : revRes.data.reviews || revRes.data.data || []
            );
          } catch {
            setReviews([]);
          }
        }
      } catch {
        setError('Service not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      navigate('/dashboard/provider');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`h-4 w-4 ${i < full ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-xl text-red-400">{error || 'Service not found.'}</p>
        <Link to="/services" className="mt-4 text-blue-400 hover:text-blue-300">
          Back to Services
        </Link>
      </div>
    );
  }

  const isOwner = user && service.provider && (user._id === service.provider._id || user._id === service.provider.id);
  const providerId = service.provider?._id || service.provider?.id;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link to="/services" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400">
          &larr; Back to Services
        </Link>

        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-800 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{service.title}</h1>
              <span className="mt-2 inline-block rounded bg-blue-600/10 px-3 py-1 text-sm font-medium text-blue-400">
                {service.category}
              </span>
            </div>
            <span className="text-3xl font-bold text-white">${service.price}</span>
          </div>

          <p className="mt-6 leading-relaxed text-gray-300 whitespace-pre-wrap">{service.description}</p>

          {service.images?.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {service.images.map((url, i) => (
                <img key={i} src={url} alt={`${service.title} ${i + 1}`} className="h-32 w-full rounded-lg border border-gray-700 object-cover" />
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
            <span>Delivery: {service.deliveryTime} days</span>
          </div>

          {service.provider && (
            <div className="mt-8 rounded-lg border border-gray-700 bg-gray-900 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Provider</h3>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-lg font-bold text-blue-400">
                  {service.provider.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold">{service.provider.name}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {renderStars(service.provider.rating || service.averageRating)}
                    <span className="ml-1 text-xs text-gray-500">
                      ({service.provider.numReviews ?? service.reviewCount ?? 0} reviews)
                    </span>
                  </div>
                  {service.provider.skills?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {service.provider.skills.map((skill) => (
                        <span key={skill} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {user && user.role === 'customer' && (
              <Link
                to={`/services/${id}/request`}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                Hire Now / Submit Request
              </Link>
            )}
            {isOwner && (
              <>
                <Link
                  to={`/services/edit/${id}`}
                  className="rounded-lg border border-gray-600 bg-gray-700 px-6 py-3 font-semibold text-white transition hover:bg-gray-600"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-gray-500">No reviews yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id || rev.id} className="rounded-lg border border-gray-800 bg-gray-800 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-bold text-indigo-400">
                        {rev.customer?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{rev.customer?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-0.5">{renderStars(rev.rating)}</div>
                      </div>
                    </div>
                    {rev.createdAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {(rev.feedback || rev.comment) && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">{rev.feedback || rev.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
