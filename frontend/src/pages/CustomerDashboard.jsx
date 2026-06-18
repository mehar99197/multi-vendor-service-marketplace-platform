import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import TasksWidget from '../components/project/TasksWidget';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
  completed: 'bg-green-500/20 text-green-400 border-green-500/50',
  'in-progress': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
  delivered: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};

function StatusBadge({ status }) {
  const color = statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center gap-4">
      <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [reqRes, projRes] = await Promise.all([
        api.get('/requests'),
        api.get('/projects'),
      ]);
      const allRequests = Array.isArray(reqRes.data) ? reqRes.data : reqRes.data.requests || [];
      const allProjects = Array.isArray(projRes.data) ? projRes.data : projRes.data.projects || [];
      setRequests(allRequests);
      setCompletedProjects(allProjects.filter((p) => p.status === 'completed' || p.status === 'delivered'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activeRequests = requests.filter((r) => r.status !== 'completed' && r.status !== 'rejected');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || 'Customer'}
          </h1>
          <p className="text-gray-400 mt-1">Manage your service requests and projects</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Active Requests"
            value={activeRequests.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Completed Projects"
            value={completedProjects.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <TasksWidget />

        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Requests</h2>
            <button
              onClick={() => navigate('/services')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Browse Services
            </button>
          </div>
          <div className="overflow-x-auto">
            {requests.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <p>No requests yet.</p>
                <button
                  onClick={() => navigate('/services')}
                  className="mt-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Browse services to create your first request
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="px-6 py-3 font-medium">Service</th>
                    <th className="px-6 py-3 font-medium">Provider</th>
                    <th className="px-6 py-3 font-medium">Budget</th>
                    <th className="px-6 py-3 font-medium">Deadline</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req._id || req.id}
                      onClick={() => {
                        if (req.status === 'accepted' || req.status === 'in-progress' || req.status === 'completed' || req.status === 'delivered') {
                          navigate(`/projects/${req.projectId || req._id}`);
                        }
                      }}
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                        req.status === 'accepted' || req.status === 'in-progress' || req.status === 'completed' || req.status === 'delivered'
                          ? 'cursor-pointer'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">{req.serviceName || req.service?.title || req.serviceId?.title || '-'}</td>
                      <td className="px-6 py-4 text-sm">{req.providerName || req.provider?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">${req.budget || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        {req.deadline ? new Date(req.deadline).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {completedProjects.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Completed Projects</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="px-6 py-3 font-medium">Service</th>
                    <th className="px-6 py-3 font-medium">Provider</th>
                    <th className="px-6 py-3 font-medium">Budget</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedProjects.map((proj) => (
                    <tr key={proj._id || proj.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${proj._id || proj.id}`)}
                    >
                      <td className="px-6 py-4 text-sm">{proj.serviceName || proj.service?.title || '-'}</td>
                      <td className="px-6 py-4 text-sm">{proj.providerName || proj.provider?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">${proj.budget || 0}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={proj.status} />
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
