import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiChevronDown, FiMapPin, FiThumbsUp, FiArrowRight } from 'react-icons/fi';
import { fetchComplaints } from '../api';

const STATUS_LABELS = { registered: 'Registered', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved', reopened: 'Re-opened', verified: 'Verified' };
const PRIORITY_COLORS = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const STATUS_COLORS = { registered: 'badge-registered', assigned: 'badge-assigned', in_progress: 'badge-in_progress', resolved: 'badge-resolved', reopened: 'badge-reopened', verified: 'badge-verified' };

export default function TrackComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', sort: 'newest' });
  const [showFilters, setShowFilters] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 20 };
      if (search) params.search = search;
      const data = await fetchComplaints(params);
      setComplaints(data.complaints || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadComplaints(); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadComplaints();
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Track Complaints</h2>
        <p className="text-gray-500 dark:text-gray-400">Search and monitor the status of civic complaints</p>
      </div>

      {/* Quick Ticket Search */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🔍 Quick Ticket Search</h3>
        <div className="flex gap-2">
          <input
            value={ticketSearch}
            onChange={e => setTicketSearch(e.target.value)}
            placeholder="Enter ticket ID (e.g., CG-2026-0001)"
            className="input-field flex-1"
          />
          <Link
            to={ticketSearch ? `/complaint/${ticketSearch}` : '#'}
            className="btn-primary"
            onClick={e => !ticketSearch && e.preventDefault()}
          >
            Track
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, description, or address..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
          <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-1">
            <FiFilter size={14} /> Filters <FiChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
            <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="input-field text-sm">
              <option value="">All Status</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filters.category} onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))} className="input-field text-sm">
              <option value="">All Categories</option>
              {['Pothole', 'Garbage', 'Streetlight', 'Water Leakage', 'Drainage', 'Road Damage', 'Encroachment', 'Public Safety'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={filters.priority} onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))} className="input-field text-sm">
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={filters.sort} onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))} className="input-field text-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
              <option value="upvotes">Most Supported</option>
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">{total} complaints found</div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No complaints found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <Link key={c.id} to={`/complaint/${c.id}`} className="card block hover:shadow-lg transition-shadow p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{c.ticket_id}</span>
                    <span className={`badge ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                    <span className={`badge ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{c.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">{c.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {c.address && <span className="flex items-center gap-1"><FiMapPin size={12} />{c.address}</span>}
                    <span className="flex items-center gap-1"><FiThumbsUp size={12} />{c.upvotes} supporters</span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <FiArrowRight className="text-gray-400 mt-2 flex-shrink-0" size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
