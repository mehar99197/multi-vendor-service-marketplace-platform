import { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import PasswordInput from '../components/common/PasswordInput';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl glass p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xl font-black text-white glow-indigo">
            T
          </span>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="mt-1 text-sm text-gray-400">Join our marketplace today</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              wrapperClassName="mt-1.5"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
            <PasswordInput
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              wrapperClassName="mt-1.5"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Repeat your password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">I want to</label>
            <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
              <option value="customer">Hire professionals</option>
              <option value="provider">Offer my services</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60 glow-indigo"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
