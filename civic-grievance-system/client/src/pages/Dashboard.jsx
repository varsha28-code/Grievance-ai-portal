import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiUsers, FiTrendingUp, FiArrowRight, FiThumbsUp, FiMapPin } from 'react-icons/fi';
import { fetchDashboardStats, fetchComplaints } from '../api';

const PRIORITY_COLORS = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const STATUS_COLORS = { registered: 'badge-registered', assigned: 'badge-assigned', in_progress: 'badge-in_progress', resolved: 'badge-resolved', reopened: 'badge-reopened', verified: 'badge-verified' };
const STATUS_LABELS = { registered: 'Registered', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved', reopened: 'Re-opened', verified: 'Verified' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchComplaints({ limit: 6, sort: 'newest' }),
    ]).then(([statsData, complaintsData]) => {
      setStats(statsData);
      setRecentComplaints(complaintsData.complaints || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  const { overview, topIssues } = stats;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to CivicResolve</h2>
        <p className="text-primary-100 text-lg mb-4">AI-Powered Smart Civic Grievance Management System</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/report" className="bg-white text-primary-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-50 transition-all inline-flex items-center gap-2">
            Report an Issue <FiArrowRight />
          </Link>
          <Link to="/track" className="bg-primary-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-400 transition-all inline-flex items-center gap-2 border border-primary-400">
            Track Complaint <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={FiUsers} label="Total Complaints" value={overview.total} color="bg-blue-500" />
        <StatCard icon={FiClock} label="Registered" value={overview.registered} color="bg-indigo-500" />
        <StatCard icon={FiUsers} label="Assigned" value={overview.assigned} color="bg-purple-500" />
        <StatCard icon={FiTrendingUp} label="In Progress" value={overview.inProgress} color="bg-amber-500" />
        <StatCard icon={FiCheckCircle} label="Resolved" value={overview.resolved} color="bg-green-500" />
        <StatCard icon={FiAlertTriangle} label="Critical" value={overview.critical} color="bg-red-500" />
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-4xl font-bold text-primary-600">{stats.resolutionRate}%</div>
          <div className="text-gray-500 dark:text-gray-400 mt-1">Resolution Rate</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${stats.resolutionRate}%` }}></div>
          </div>
        </div>
        <div className="card text-center">
          <div className="text-4xl font-bold text-amber-600">{stats.avgResolutionDays}</div>
          <div className="text-gray-500 dark:text-gray-400 mt-1">Avg. Resolution (days)</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min((stats.avgResolutionDays / 14) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="card text-center">
          <div className="text-4xl font-bold text-civic-600">{overview.total - overview.resolved}</div>
          <div className="text-gray-500 dark:text-gray-400 mt-1">Active Complaints</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-civic-600 h-2 rounded-full" style={{ width: `${((overview.total - overview.resolved) / Math.max(overview.total,1)) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Complaints</h3>
            <Link to="/track" className="text-primary-600 text-sm font-medium hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentComplaints.map(c => (
              <Link
                key={c.id}
                to={`/complaint/${c.id}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
              >
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
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
  );
}
