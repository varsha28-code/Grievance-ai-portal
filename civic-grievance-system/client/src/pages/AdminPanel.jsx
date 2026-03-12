import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { fetchComplaints, fetchOfficerPerformance, updateComplaintStatus } from '../api';

const STATUS_LABELS = { registered: 'Registered', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved', reopened: 'Re-opened' };
const STATUS_OPTIONS = ['registered', 'assigned', 'in_progress', 'resolved'];
const PRIORITY_COLORS = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const STATUS_COLORS = { registered: 'badge-registered', assigned: 'badge-assigned', in_progress: 'badge-in_progress', resolved: 'badge-resolved', reopened: 'badge-reopened' };

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    const [cData, oData] = await Promise.all([
      fetchComplaints({ status: filter, limit: 50, sort: 'priority' }),
      fetchOfficerPerformance(),
    ]);
    setComplaints(cData.complaints || []);
    setOfficers(oData);
    setLoading(false);
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdating(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus, `Status updated to ${newStatus} by admin`);
      loadData();
    } catch (err) {
      console.error(err);
    }
    setUpdating(null);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage complaints, officers, and workflow</p>
        </div>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!filter ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
          All ({complaints.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === key ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Officer Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {officers.slice(0, 4).map(o => (
          <div key={o.id} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-bold">{o.name.charAt(0)}</div>
              <div>
                <p className="font-medium text-sm">{o.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{o.department}</p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Pending: <strong className="text-amber-600">{o.pending}</strong></span>
              <span>Resolved: <strong className="text-green-600">{o.resolved}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Complaints Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Ticket</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Issue</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Category</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Priority</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Votes</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="py-4"><div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div></td></tr>
                ))
              ) : complaints.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">No complaints found</td></tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-primary-600">{c.ticket_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm truncate max-w-xs">{c.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{c.address}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">{c.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={c.status}
                        onChange={e => handleStatusUpdate(c.id, e.target.value)}
                        disabled={updating === c.id}
                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${STATUS_COLORS[c.status]} ${updating === c.id ? 'opacity-50' : ''}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-semibold text-primary-600">{c.upvotes}</td>
                    <td className="py-3 px-4 text-center">
                      <Link to={`/complaint/${c.id}`} className="text-primary-600 hover:text-primary-700">
                        <FiArrowRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
