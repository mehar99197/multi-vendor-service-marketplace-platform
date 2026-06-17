import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold">My Requests</h1>
          <p className="text-gray-400 mt-1">Track all your service requests</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">{error}</div>
        )}

        <div className="bg-gray-800 rounded-xl border border-gray-700">
          {requests.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
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
                      key={req._id}
                      onClick={() => req.projectId && navigate(`/projects/${req.projectId}`)}
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                        req.projectId ? 'cursor-pointer' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">{req.service?.title || req.serviceName || '-'}</td>
                      <td className="px-6 py-4 text-sm">{req.provider?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">${req.budget || 0}</td>
                      <td className="px-6 py-4 text-sm">{req.deadline ? new Date(req.deadline).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          req.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                          req.status === 'accepted' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                          req.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        }`}>
                          {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
