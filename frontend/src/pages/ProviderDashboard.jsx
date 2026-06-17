import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

function StatCard({ title, value, icon, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    purple: 'bg-purple-500/10 text-purple-400',
    indigo: 'bg-indigo-500/10 text-indigo-400',
  };
  const iconBg = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeProjects: 0,
    pendingRequests: 0,
    averageRating: 0,
  });
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, reqRes, projRes] = await Promise.all([
        api.get('/providers/stats'),
        api.get('/requests'),
        api.get('/projects'),
      ]);
      setStats(statsRes.data);
      const allRequests = Array.isArray(reqRes.data) ? reqRes.data : reqRes.data.requests || [];
      const allProjects = Array.isArray(projRes.data) ? projRes.data : projRes.data.projects || [];
      setRequests(allRequests);
      setProjects(allProjects.filter((p) => p.status === 'in-progress' || p.status === 'accepted'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (id, status) => {
    setActionLoading(id);
    try {
      await api.put(`/requests/${id}/status`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === id || r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} request`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || 'Provider'}
          </h1>
          <p className="text-gray-400 mt-1">Manage your services, projects, and earnings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earnings"
            value={`$${(stats.totalEarnings || 0).toLocaleString()}`}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects || projects.length}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests || pendingRequests.length}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Average Rating"
            value={stats.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : 'N/A'}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Earnings Overview</h2>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-green-400">
              ${(stats.totalEarnings || 0).toLocaleString()}
            </div>
            <p className="text-gray-400 mt-1">Total lifetime earnings</p>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">
                Pending Requests ({pendingRequests.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {pendingRequests.map((req) => (
                <div key={req._id || req.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white">
                        {req.serviceName || req.service?.title || 'Service Request'}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-400">
                        <p><span className="text-gray-500">Client:</span> {req.customerName || req.customer?.name || 'N/A'}</p>
                        <p><span className="text-gray-500">Budget:</span> <span className="text-green-400">${req.budget || 0}</span></p>
                        <p><span className="text-gray-500">Deadline:</span> {req.deadline ? new Date(req.deadline).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      {req.requirements && (
                        <p className="mt-2 text-sm text-gray-400">
                          <span className="text-gray-500">Requirements:</span> {req.requirements}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <button
                        onClick={() => handleRequestAction(req._id || req.id, 'accepted')}
                        disabled={actionLoading === (req._id || req.id)}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {actionLoading === (req._id || req.id) ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Accepting...
                          </span>
                        ) : (
                          'Accept'
                        )}
                      </button>
                      <button
                        onClick={() => handleRequestAction(req._id || req.id, 'rejected')}
                        disabled={actionLoading === (req._id || req.id)}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Active Projects ({projects.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="px-6 py-3 font-medium">Service</th>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Budget</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => (
                    <tr key={proj._id || proj.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm">{proj.serviceName || proj.service?.title || '-'}</td>
                      <td className="px-6 py-4 text-sm">{proj.customerName || proj.customer?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">${proj.budget || 0}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/50">
                          {proj.status?.charAt(0).toUpperCase() + proj.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/projects/${proj._id || proj.id}`)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                        >
                          Updates
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
