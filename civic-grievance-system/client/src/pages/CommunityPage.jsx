import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiThumbsUp, FiMapPin, FiClock, FiRefreshCw } from 'react-icons/fi';
import { fetchComplaints, upvoteComplaint } from '../api';
import { Link } from 'react-router-dom';

const PRIORITY_COLORS = {
  critical: 'bg-red-500/10 text-red-500 border border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  low: 'bg-green-500/10 text-green-500 border border-green-500/20',
};

const STATUS_LABELS = {
  registered: 'Registered',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  reopened: 'Reopened',
  verified: 'Verified',
};

export default function CommunityPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadComplaints = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await fetchComplaints({ limit: 50, sort: 'upvotes' });
      setComplaints(res.complaints || []);
    } catch (error) {
      console.error("Error loading community feed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleUpvote = async (id, e) => {
    e.preventDefault();
    try {
      const updated = await upvoteComplaint(id);
      if (updated && updated.id) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, upvotes: updated.upvotes, priority: updated.priority } : c));
      } else {
        // Fallback optimistic update if response is generic success
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c));
      }
    } catch (error) {
      console.error("Error upvoting complaint:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Community Board</h1>
          <p className="text-gray-500 dark:text-gray-400">See active issues in the community, support reports, and follow progress.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => loadComplaints(true)}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            title="Refresh board"
            disabled={refreshing || loading}
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={20} />
          </button>
          <div className="bg-primary-500/10 text-primary-500 p-4 rounded-3xl flex items-center gap-3 border border-primary-500/20">
            <FiUsers size={28} />
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Active Citizen Reports</p>
              <p className="text-xl font-black">{complaints.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse h-64" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 text-lg">No active community issues found.</p>
          <Link to="/report" className="btn-primary inline-block mt-4">Report an Issue</Link>
        </div>
      ) : (
        <div className="grid gap-8">
          {complaints.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
              className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all p-6 md:p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white shadow-md">
                  {(c.citizen_name || 'Anonymous').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{c.citizen_name || 'Anonymous'}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1 truncate"><FiMapPin size={12} /> {c.address || 'Bangalore'}</span>
                    <span className="flex items-center gap-1 shrink-0"><FiClock size={12} /> {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.medium}`}>
                    {c.priority}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full capitalize">
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">{c.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 whitespace-pre-line line-clamp-4">
                {c.description}
              </p>

              {c.image_url && (
                <div className="mb-6 rounded-2xl overflow-hidden max-h-80 border border-gray-100 dark:border-gray-700">
                  <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={(e) => handleUpvote(c.id, e)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <FiThumbsUp size={18} /> {c.upvotes} Votes
                  </button>
                  {c.merged_count > 0 && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-xl border border-amber-200/30">
                      🔗 {c.merged_count} Merged reports
                    </span>
                  )}
                </div>
                <Link to={`/complaint/${c.id}`} className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  View Details & Track →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
