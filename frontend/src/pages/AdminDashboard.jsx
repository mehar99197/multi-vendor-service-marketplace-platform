import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Reveal, Stagger, StaggerItem } from '../components/common/Motion';
import Loading from '../components/common/Loading';

function Badge({ label, color }) {
  const colorMap = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    red: 'bg-red-500/20 text-red-300 border-red-500/40',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
  };
  const cls = colorMap[color] || colorMap.gray;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

function StatCard({ title, value, gradient = 'from-indigo-500 to-blue-500' }) {
  return (
    <div className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
      </div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'blue' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colorMap = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-teal-500',
    yellow: 'from-yellow-500 to-amber-500',
    red: 'from-red-500 to-rose-500',
    purple: 'from-purple-500 to-fuchsia-500',
    indigo: 'from-indigo-500 to-fuchsia-500',
  };
  const barColor = colorMap[color] || colorMap.blue;
  return (
    <div className="w-full bg-white/10 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Bar({ label, value, max, color, textColor }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400 capitalize">{label}</span>
        <span className={`font-medium ${textColor}`}>{value}</span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
    </div>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requestStats, setRequestStats] = useState({ pending: 0, accepted: 0, rejected: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, usersRes, serviceStatsRes, requestStatsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/service-stats'),
          api.get('/admin/request-stats'),
        ]);
        setCounts(statsRes.data);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || []);
        // service-stats returns categories as [{ _id: 'Web Development', count: N }]
        setCategories(
          (serviceStatsRes.data.categories || []).map((c) => ({
            category: c._id || 'Uncategorized',
            count: c.count || 0,
          }))
        );
        setRequestStats(requestStatsRes.data || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading admin data…" />
      </div>
    );
  }

  const userCounts = counts?.userCounts || { total: 0, customers: 0, providers: 0, admins: 0 };
  const serviceCounts = counts?.serviceCounts || { total: 0 };
  const requestCounts = counts?.requestCounts || { total: 0 };
  const projectCounts = counts?.projectCounts || { total: 0 };

  const maxRoleCount = Math.max(userCounts.customers, userCounts.providers, userCounts.admins, 1);
  const maxCatCount = Math.max(...categories.map((c) => c.count), 1);

  const statusEntries = [
    { status: 'pending', count: requestStats.pending || 0, color: 'yellow', text: 'text-yellow-400' },
    { status: 'accepted', count: requestStats.accepted || 0, color: 'blue', text: 'text-blue-400' },
    { status: 'rejected', count: requestStats.rejected || 0, color: 'red', text: 'text-red-400' },
    { status: 'completed', count: requestStats.completed || 0, color: 'green', text: 'text-emerald-400' },
  ];
  const maxReqStatusCount = Math.max(...statusEntries.map((s) => s.count), 1);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'services', label: 'Services' },
    { id: 'requests', label: 'Requests' },
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Reveal className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Admin <span className="text-gradient">Dashboard</span></h1>
          <p className="text-gray-400 mt-1">Platform overview and management</p>
        </Reveal>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StaggerItem><StatCard title="Total Users" value={userCounts.total} gradient="from-indigo-500 to-blue-500" /></StaggerItem>
          <StaggerItem><StatCard title="Total Services" value={serviceCounts.total} gradient="from-emerald-500 to-teal-500" /></StaggerItem>
          <StaggerItem><StatCard title="Total Requests" value={requestCounts.total} gradient="from-yellow-500 to-amber-500" /></StaggerItem>
          <StaggerItem><StatCard title="Total Projects" value={projectCounts.total} gradient="from-fuchsia-500 to-purple-500" /></StaggerItem>
        </Stagger>

        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white glow-indigo'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
              <div className="space-y-4">
                <Bar label="Customers" value={userCounts.customers} max={maxRoleCount} color="blue" textColor="text-blue-400" />
                <Bar label="Providers" value={userCounts.providers} max={maxRoleCount} color="green" textColor="text-emerald-400" />
                <Bar label="Admins" value={userCounts.admins} max={maxRoleCount} color="purple" textColor="text-purple-400" />
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Services by Category</h3>
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <p className="text-gray-400 text-sm">No services yet</p>
                ) : (
                  categories.map((c) => (
                    <Bar key={c.category} label={c.category} value={c.count} max={maxCatCount} color="indigo" textColor="text-indigo-400" />
                  ))
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Requests by Status</h3>
              <div className="space-y-4">
                {statusEntries.map((s) => (
                  <Bar key={s.status} label={s.status} value={s.count} max={maxReqStatusCount} color={s.color} textColor={s.text} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass rounded-2xl overflow-x-auto">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-semibold">All Users ({userCounts.total})</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id || u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge
                        label={u.role?.charAt(0).toUpperCase() + u.role?.slice(1) || 'User'}
                        color={u.role === 'admin' ? 'red' : u.role === 'provider' ? 'green' : 'blue'}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Services by Category</h2>
            {categories.length === 0 ? (
              <p className="text-gray-400 text-sm">No services yet</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c) => (
                  <div key={c.category} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{c.category}</h3>
                      <span className="text-2xl font-bold text-indigo-400">{c.count}</span>
                    </div>
                    <ProgressBar value={c.count} max={maxCatCount} color="indigo" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Requests by Status</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statusEntries.map((s) => {
                const bgMap = {
                  yellow: 'bg-yellow-500/10 border-yellow-500/30',
                  blue: 'bg-blue-500/10 border-blue-500/30',
                  red: 'bg-red-500/10 border-red-500/30',
                  green: 'bg-emerald-500/10 border-emerald-500/30',
                };
                return (
                  <div key={s.status} className={`rounded-xl p-5 border ${bgMap[s.color]}`}>
                    <p className={`text-3xl font-bold ${s.text}`}>{s.count}</p>
                    <p className="mt-1 text-gray-400 capitalize">{s.status}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
