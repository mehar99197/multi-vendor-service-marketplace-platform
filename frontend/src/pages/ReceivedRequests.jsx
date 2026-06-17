import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ReceivedRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

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

  const handleAction = async (id, status) => {
    setActionLoading(id);
    try {
      await api.put(`/requests/${id}/status`, { status });
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
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
          <h1 className="text-3xl font-bold">Received Requests</h1>
          <p className="text-gray-400 mt-1">Review and respond to client requests</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">{error}</div>
        )}

        <div className="bg-gray-800 rounded-xl border border-gray-700">
          {requests.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No requests received yet.</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {requests.map((req) => (
                <div key={req._id} className="p-6 hover:bg-gray-700/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{req.service?.title || req.serviceName || 'Service Request'}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-400">
                        <p><span className="text-gray-500">Client:</span> {req.customer?.name || 'N/A'}</p>
                        <p><span className="text-gray-500">Budget:</span> <span className="text-green-400">${req.budget || 0}</span></p>
                        <p><span className="text-gray-500">Deadline:</span> {req.deadline ? new Date(req.deadline).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      {req.requirements && (
                        <p className="mt-2 text-sm text-gray-400"><span className="text-gray-500">Requirements:</span> {req.requirements}</p>
                      )}
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          req.status === 'accepted' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                          req.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                          'bg-green-500/20 text-green-400 border-green-500/50'
                        }`}>
                          {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-3 flex-shrink-0">
                        <button
                          onClick={() => handleAction(req._id, 'accepted')}
                          disabled={actionLoading === req._id}
                          className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg text-sm font-medium"
                        >
                          {actionLoading === req._id ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleAction(req._id, 'rejected')}
                          disabled={actionLoading === req._id}
                          className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.status !== 'pending' && req.status !== 'rejected' && req.projectId && (
                      <button
                        onClick={() => navigate(`/projects/${req.projectId}`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                      >
                        View Project
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
