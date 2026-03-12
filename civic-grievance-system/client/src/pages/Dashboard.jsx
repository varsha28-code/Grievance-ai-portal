import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiUsers, FiTrendingUp, FiArrowRight, FiThumbsUp, FiMapPin, FiPlusCircle, FiRefreshCw } from 'react-icons/fi';
import { fetchComplaints } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFirebaseDashboardStats } from '../hooks/useFirebaseDashboardStats';

const PRIORITY_COLORS = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const STATUS_COLORS = { registered: 'badge-registered', assigned: 'badge-assigned', in_progress: 'badge-in_progress', resolved: 'badge-resolved', reopened: 'badge-reopened', verified: 'badge-verified' };
const STATUS_LABELS = { registered: 'Registered', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved', reopened: 'Re-opened', verified: 'Verified' };

export default function Dashboard() {
  const { user, isCitizen, isAdmin, isOfficer } = useAuth();
  
  // 🔥 New Real-time Firebase Firestore Stats
  const firebaseStats = useFirebaseDashboardStats();

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = () => {
    const complaintsParams = isCitizen && user?.email
      ? { limit: 20, sort: 'newest', search: user.email }
      : { limit: 6, sort: 'newest' };

    Promise.all([
      fetchComplaints({ limit: 6, sort: 'newest' }),
      isCitizen && user?.email
        ? fetchComplaints({ limit: 20, sort: 'newest' })
        : Promise.resolve({ complaints: [] }),
    ]).then(([cityComplaints, userComplaintsData]) => {
      setRecentComplaints(cityComplaints.complaints || []);
      // Filter citizen complaints by their email
      if (isCitizen && user?.email) {
        const mine = (userComplaintsData.complaints || []).filter(
          c => c.citizen_email === user.email
        );
        setMyComplaints(mine);
      }
      setLastRefresh(new Date());
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    // Live refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || firebaseStats.isLoading) return <LoadingSkeleton />;

  // Note: we still need to grab `topIssues` from a future query, but for now we pull it from recentComplaints
  const topIssues = recentComplaints.slice(0, 5) || [];
  
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Citizen-specific mini stats
  const myTotal = myComplaints.length;
  const myResolved = myComplaints.filter(c => c.status === 'resolved').length;
  const myPending = myComplaints.filter(c => !['resolved', 'verified'].includes(c.status)).length;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── PERSONALIZED HERO ── */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-primary-200 text-sm mb-1">👋 Welcome back,</p>
          <h2 className="text-3xl font-bold mb-1">{firstName}!</h2>
          <p className="text-primary-100 text-sm mb-4">
            {isCitizen
              ? `You have ${myPending} active complaint${myPending !== 1 ? 's' : ''} in progress.`
              : `City-wide overview — ${firebaseStats.total} total complaints tracked.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/report" className="bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-50 transition-all inline-flex items-center gap-2 text-sm">
              <FiPlusCircle size={16} /> Report an Issue
            </Link>
            <Link to="/track" className="bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-400 transition-all inline-flex items-center gap-2 border border-primary-400 text-sm">
              Track Complaint <FiArrowRight />
            </Link>
            <button onClick={loadData} className="bg-primary-500/50 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-500 transition-all flex items-center gap-2 border border-primary-400/50 text-sm" title="Refresh data">
              <FiRefreshCw size={14} /> Live
            </button>
          </div>
          <p className="text-primary-300 text-xs mt-3">Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 30s</p>
        </div>
      </div>

      {/* ── MY COMPLAINTS (citizens only) ── */}
      {isCitizen && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">📋 My Complaints</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Total: <strong>{myTotal}</strong> · Resolved: <strong className="text-green-600">{myResolved}</strong> · Active: <strong className="text-amber-600">{myPending}</strong></span>
              <Link to="/track" className="text-primary-600 text-sm font-medium hover:underline">View All →</Link>
            </div>
          </div>
          {myComplaints.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-3">You haven't reported any issues yet.</p>
              <Link to="/report" className="btn-primary inline-flex items-center gap-2 text-sm">
                <FiPlusCircle size={16} /> Report Your First Issue
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myComplaints.slice(0, 8).map(c => (
                <Link key={c.id} to={`/complaint/${c.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{c.ticket_id}</span>
                      <span className={`badge ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                      <span className={`badge ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">{c.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><FiMapPin size={11} />{c.address || 'Location not set'}</span>
                      <span className="flex items-center gap-1"><FiThumbsUp size={11} />{c.upvotes} votes</span>
                    </div>
                  </div>
                  <FiArrowRight className="text-gray-400 mt-2 flex-shrink-0" size={14} />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CITY STATS GRID ── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          {isCitizen ? '🏙️ City-Wide Overview' : '📊 Live Stats'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={FiUsers} label="Total" value={firebaseStats.total} color="bg-blue-500" />
          <StatCard icon={FiClock} label="Registered" value={firebaseStats.registered} color="bg-indigo-500" />
          <StatCard icon={FiUsers} label="Assigned" value={firebaseStats.assigned} color="bg-purple-500" />
          <StatCard icon={FiTrendingUp} label="In Progress" value={firebaseStats.inProgress} color="bg-amber-500" />
          <StatCard icon={FiCheckCircle} label="Resolved" value={firebaseStats.resolved} color="bg-green-500" />
          <StatCard icon={FiAlertTriangle} label="Critical" value={firebaseStats.critical} color="bg-red-500" />
        </div>
      </div>

      {/* ── PERFORMANCE METRICS ── */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-4xl font-bold text-primary-600">{firebaseStats.resolutionRate}%</div>
          <div className="text-gray-500 dark:text-gray-400 mt-1">Resolution Rate</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${firebaseStats.resolutionRate}%` }} />
          </div>
        </div>
        <div className="card text-center">
          <div className="text-4xl font-bold text-amber-600">{firebaseStats.avgResolutionDays}</div>
          <div className="text-gray-500 dark:text-gray-400 mt-1">Avg. Resolution (days)</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min((firebaseStats.avgResolutionDays / 14) * 100, 100)}%` }} />
          </div>
        </div>
        <div className="card text-center">
          <div className="text-4xl font-bold text-civic-600">{firebaseStats.active}</div>
          <div className="text-gray-500 dark:text-gray-400 mt-1">Active Complaints</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-civic-600 h-2 rounded-full" style={{ width: `${(firebaseStats.active / Math.max(firebaseStats.total, 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent City Complaints */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">🏙️ Recent City Complaints</h3>
            <Link to="/track" className="text-primary-600 text-sm font-medium hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentComplaints.map(c => (
              <Link key={c.id} to={`/complaint/${c.id}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{c.ticket_id}</span>
                    <span className={`badge ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                    <span className={`badge ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{c.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><FiMapPin size={12} />{c.address || 'N/A'}</span>
                    <span className="flex items-center gap-1"><FiThumbsUp size={12} />{c.upvotes}</span>
                  </div>
                </div>
                <FiArrowRight className="text-gray-400 mt-2 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔥 Top Issues by Votes</h3>
          <div className="space-y-3">
            {topIssues.map((issue, i) => (
              <Link key={issue.id} to={`/complaint/${issue.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{issue.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{issue.category}</p>
                </div>
                <div className="flex items-center gap-1 text-primary-600 font-semibold text-sm">
                  <FiThumbsUp size={14} /> {issue.upvotes}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex flex-col items-center text-center p-4">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="text-white" size={20} />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
}

