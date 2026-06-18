import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import StarRating from '../components/common/StarRating';
import MessageThread from '../components/project/MessageThread';
import TaskPanel from '../components/project/TaskPanel';
import ContactNotes from '../components/project/ContactNotes';

const STEPS = [
  { key: 'pending', label: 'Pending', icon: '1' },
  { key: 'accepted', label: 'Accepted', icon: '2' },
  { key: 'in-progress', label: 'In Progress', icon: '3' },
  { key: 'completed', label: 'Completed', icon: '4' },
  { key: 'delivered', label: 'Delivered', icon: '5' },
];

const STATUS_ORDER = {
  pending: 0,
  accepted: 1,
  'in-progress': 2,
  completed: 3,
  delivered: 4,
};

function WorkflowSteps({ currentStatus }) {
  const currentIndex = STATUS_ORDER[currentStatus] ?? -1;

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center min-w-max px-2">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;
          const showLine = i < STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-blue-400'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {showLine && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 rounded ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UpdateItem({ update }) {
  const authorName = update.addedBy?.name || update.userName || 'User';
  const text = update.text || update.message || '';
  return (
    <div className="flex gap-3 p-4 bg-gray-700/30 rounded-lg border border-gray-700">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {authorName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">{authorName}</span>
          <span className="text-xs text-gray-500">
            {update.createdAt ? new Date(update.createdAt).toLocaleString() : ''}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-300">{text}</p>
      </div>
    </div>
  );
}

export default function ProjectTracking() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const isProvider = user?.role === 'provider';
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${id}`);
      const data = res.data.project || res.data;
      setProject(data);
      setUpdates(data.updates || []);

      // Once delivered, a customer can review. Check whether they already have one
      // so we show their existing review instead of the form (avoids a duplicate 400).
      if (user?.role === 'customer' && data.status === 'delivered') {
        const requestId = data.request?._id || data.request;
        try {
          const revRes = await api.get('/reviews/my');
          const list = Array.isArray(revRes.data) ? revRes.data : revRes.data.reviews || [];
          setMyReview(list.find((r) => String(r.request) === String(requestId)) || null);
        } catch {
          setMyReview(null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      setReviewError('Please select a star rating.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const requestId = project.request?._id || project.request;
      const { data } = await api.post('/reviews', {
        request: requestId,
        rating: reviewRating,
        feedback: reviewFeedback,
      });
      setMyReview(data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusLoading(true);
    setActionError('');
    try {
      await api.put(`/projects/${id}/status`, { status: newStatus });
      setProject((prev) => ({ ...prev, status: newStatus }));
      fetchProject();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;
    setSendingUpdate(true);
    setActionError('');
    try {
      await api.post(`/projects/${id}/updates`, { text: updateMessage });
      setUpdateMessage('');
      fetchProject();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to add update');
    } finally {
      setSendingUpdate(false);
    }
  };

  const getNextStatus = () => {
    const order = ['pending', 'accepted', 'in-progress', 'completed', 'delivered'];
    const currentIdx = order.indexOf(project?.status);
    if (currentIdx < order.length - 1) return order[currentIdx + 1];
    return null;
  };

  const getNextStatusLabel = () => {
    const labels = {
      pending: 'Accept Project',
      accepted: 'Start Work',
      'in-progress': 'Mark Completed',
    };
    return labels[project?.status] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl font-semibold">Error loading project</p>
          <p className="mt-2 text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Project not found</p>
      </div>
    );
  }

  const nextStatus = getNextStatus();
  const nextLabel = getNextStatusLabel();

  // Work out which side the viewer is, and who the "contact" (other party) is.
  const currentId = user?._id;
  const customerId = project.customer?._id || project.customer;
  const providerId = project.provider?._id || project.provider;
  const isCustomerParty = String(currentId) === String(customerId);
  const isProviderParty = String(currentId) === String(providerId);
  const isParty = isCustomerParty || isProviderParty;
  const counterpart = isCustomerParty ? project.provider : isProviderParty ? project.customer : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{project.serviceName || project.service?.title || 'Project'}</h1>
          <p className="text-gray-400 mt-1">Track project progress and updates</p>
        </div>

        {actionError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {actionError}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Progress</h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium border bg-blue-500/20 text-blue-400 border-blue-500/50 capitalize">
              {project.status}
            </span>
          </div>
          <WorkflowSteps currentStatus={project.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Project Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Service</p>
                <p className="text-white">{project.serviceName || project.service?.title || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Customer</p>
                <p className="text-white">{project.customerName || project.customer?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Provider</p>
                <p className="text-white">{project.providerName || project.provider?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Budget</p>
                <p className="text-white font-medium">${project.request?.budget ?? project.budget ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Deadline</p>
                <p className="text-white">
                  {(project.request?.deadline || project.deadline)
                    ? new Date(project.request?.deadline || project.deadline).toLocaleDateString()
                    : '-'}
                </p>
              </div>
              {(project.request?.requirements || project.requirements) && (
                <div>
                  <p className="text-sm text-gray-400">Requirements</p>
                  <p className="text-white text-sm">{project.request?.requirements || project.requirements}</p>
                </div>
              )}
            </div>
          </div>

          {(isProvider || isCustomer) && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-4">
                {isProvider && nextLabel && ['pending', 'accepted', 'in-progress'].includes(project.status) && (
                  <button
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={statusLoading}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {statusLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Updating...
                      </span>
                    ) : (
                      nextLabel
                    )}
                  </button>
                )}
                {isCustomer && project.status === 'completed' && (
                  <button
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={statusLoading}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {statusLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Updating...
                      </span>
                    ) : (
                      'Confirm Delivery'
                    )}
                  </button>
                )}
                {((isProvider && project.status === 'completed') ||
                  (isCustomer && ['pending', 'accepted', 'in-progress'].includes(project.status))) && (
                  <p className="text-sm text-gray-400">
                    {isProvider
                      ? 'Waiting for the customer to confirm delivery.'
                      : 'The provider is working on your project. You can confirm delivery once it is marked completed.'}
                  </p>
                )}
                {project.status === 'delivered' && (
                  <div className="space-y-4">
                    <p className="text-sm text-green-400">This project has been delivered and completed.</p>
                    {isCustomer &&
                      (myReview ? (
                        <div className="rounded-lg border border-gray-700 bg-gray-700/30 p-4">
                          <p className="text-sm font-medium text-white">Your review</p>
                          <div className="mt-1">
                            <StarRating rating={myReview.rating} />
                          </div>
                          {myReview.feedback && (
                            <p className="mt-2 text-sm text-gray-300">{myReview.feedback}</p>
                          )}
                        </div>
                      ) : (
                        <form
                          onSubmit={handleSubmitReview}
                          className="rounded-lg border border-gray-700 bg-gray-700/30 p-4"
                        >
                          <p className="text-sm font-medium text-white">Leave a review</p>
                          <p className="mt-1 text-xs text-gray-400">
                            How was your experience with this provider?
                          </p>
                          <div className="mt-2">
                            <StarRating rating={reviewRating} interactive onRate={setReviewRating} />
                          </div>
                          <textarea
                            value={reviewFeedback}
                            onChange={(e) => setReviewFeedback(e.target.value)}
                            rows={3}
                            placeholder="Share details about your experience (optional)..."
                            className="mt-3 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                          />
                          {reviewError && <p className="mt-2 text-sm text-red-400">{reviewError}</p>}
                          <button
                            type="submit"
                            disabled={reviewSubmitting || !reviewRating}
                            className="mt-3 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </form>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isParty && (
          <div className="mb-8">
            <MessageThread projectId={id} />
          </div>
        )}

        {isParty && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <TaskPanel projectId={id} />
            {counterpart && (
              <ContactNotes subjectId={counterpart._id} subjectName={counterpart.name} />
            )}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Updates & Activity Log</h3>

          <form onSubmit={handleAddUpdate} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="Add an update..."
                className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button
                type="submit"
                disabled={sendingUpdate || !updateMessage.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                {sendingUpdate ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Sending...
                  </span>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </form>

          {updates.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No updates yet. Be the first to add one!</p>
          ) : (
            <div className="space-y-3">
              {[...updates]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .map((update, i) => (
                  <UpdateItem key={update._id || update.id || i} update={update} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
