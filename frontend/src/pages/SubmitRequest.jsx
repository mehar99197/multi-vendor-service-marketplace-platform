import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

export default function SubmitRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    requirements: '',
    budget: '',
    deadline: '',
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        const svc = res.data.service || res.data.data || res.data;
        setService(svc);
        setForm((prev) => ({ ...prev, budget: svc.price || '' }));
      } catch {
        setError('Service not found.');
      } finally {
        setLoadingService(false);
      }
    };
    fetchService();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.requirements || !form.budget || !form.deadline) {
      setError('All fields are required.');
      return;
    }
    if (Number(form.budget) <= 0) {
      setError('Budget must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/requests', {
        service: id,
        requirements: form.requirements,
        budget: Number(form.budget),
        deadline: form.deadline,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingService) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-xl text-red-400">{error}</p>
        <Link to="/services" className="mt-4 text-blue-400 hover:text-blue-300">
          Back to Services
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <svg className="h-16 w-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="mt-4 text-2xl font-bold">Request Submitted!</h2>
        <p className="mt-2 text-gray-400">The provider will review and respond to your request shortly.</p>
        <div className="mt-6 flex gap-4">
          <Link
            to="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-500"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/services"
            className="rounded-lg border border-gray-600 bg-gray-800 px-6 py-2.5 font-semibold text-gray-200 transition hover:bg-gray-700"
          >
            Browse More Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to={`/services/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400">
          &larr; Back to Service
        </Link>

        {service && (
          <div className="mt-6 rounded-xl border border-gray-800 bg-gray-800 p-6">
            <h2 className="text-xl font-bold">{service.title}</h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
              <span>by {service.provider?.name || 'Provider'}</span>
              <span className="text-lg font-bold text-white">${service.price}</span>
            </div>
          </div>
        )}

        <h1 className="mt-8 text-2xl font-bold">Submit Request</h1>
        <p className="mt-1 text-gray-400">Tell the provider what you need.</p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Requirements</label>
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              rows={6}
              placeholder="Describe your project requirements in detail..."
              className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">Budget ($)</label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
