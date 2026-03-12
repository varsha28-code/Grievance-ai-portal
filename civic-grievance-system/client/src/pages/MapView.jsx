import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FiNavigation, FiRefreshCw, FiMapPin, FiFilter, FiInfo, FiList, FiMap } from 'react-icons/fi';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const API_BASE = 'http://localhost:3001/api';

// Bangalore city center + surrounding area coords for demo seeding
const CITY_CENTER = [12.9716, 77.5946]; // Bangalore
const AREA_NAMES = [
  'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'Rajajinagar',
  'Malleshwaram', 'HSR Layout', 'Electronic City', 'Hebbal', 'Banashankari',
  'BTM Layout', 'Marathahalli', 'Yelahanka', 'JP Nagar', 'Vijayanagar',
];

const STATUS_COLORS = {
  registered: '#3b82f6',
  assigned:   '#8b5cf6',
  in_progress:'#f59e0b',
  resolved:   '#22c55e',
  reopened:   '#ef4444',
};

const PRIORITY_RADIUS = { critical: 14, high: 11, medium: 8, low: 6 };

const CATEGORY_EMOJI = {
  'Pothole': '🕳️', 'Garbage': '🗑️', 'Streetlight': '💡',
  'Water Leakage': '💧', 'Drainage': '🚰', 'Road Damage': '🛤️',
  'Encroachment': '🏗️', 'Public Safety': '⚠️', 'Noise Pollution': '📢',
  'Stray Animals': '🐕', 'Tree Fall': '🌳', 'Sewage': '🪣',
};

// Seed complaints with Bangalore coords when none exist
function maybeAddCoords(c, idx) {
  if (c.latitude && c.longitude) return c;
  const seed = idx * 137.5;  // golden angle offset for nice spread
  const r = 0.03 + (Math.sin(seed) * 0.5 + 0.5) * 0.06;
  const angle = (seed % 360) * (Math.PI / 180);
  return {
    ...c,
    latitude:  CITY_CENTER[0] + r * Math.cos(angle),
    longitude: CITY_CENTER[1] + r * Math.sin(angle),
    address:   c.address || AREA_NAMES[idx % AREA_NAMES.length],
  };
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14, { duration: 1.2 });
  }, [position, map]);
  return null;
}

function RecenterButton({ userLocation, onLocate }) {
  return (
    <button
      onClick={onLocate}
      title="My Location"
      className="bg-white shadow-md hover:bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 flex items-center gap-1.5 transition-colors"
    >
      <FiNavigation size={15} />
      My Location
    </button>
  );
}

export default function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [view, setView] = useState('map'); // 'map' | 'list'
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({ limit: 200 });
      if (filters.status)   params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      const res = await fetch(`${API_BASE}/complaints?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const withCoords = (data.complaints || []).map((c, i) => maybeAddCoords(c, i));
      setComplaints(withCoords);
      setError('');
    } catch (err) {
      setError('Could not load complaints. Make sure the backend server is running on port 3001.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [filters]);

  const locateUser = () => {
    setLocating(true);
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation([pos.coords.latitude, pos.coords.longitude]); setLocating(false); },
      ()  => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const categories = [...new Set(complaints.map(c => c.category).filter(Boolean))];

  const filtered = complaints.filter(c => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.category && c.category !== filters.category) return false;
    if (filters.priority && c.priority !== filters.priority) return false;
    return c.latitude && c.longitude;
  });

  const mapCenter = userLocation || CITY_CENTER;

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiMapPin className="text-indigo-500" /> City Issue Map
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {loading ? 'Loading...' : `${filtered.length} active issues across the city`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(v => v === 'map' ? 'list' : 'map')}
            className="flex items-center gap-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-200">
            {view === 'map' ? <><FiList size={15}/> List View</> : <><FiMap size={15}/> Map View</>}
          </button>
          <button onClick={fetchComplaints} disabled={refreshing}
            className="flex items-center gap-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-200 disabled:opacity-50">
            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-wrap gap-2 items-center">
        <FiFilter size={15} className="text-gray-400 mr-1" />
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Status</option>
          <option value="registered">Registered</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="reopened">Reopened</option>
        </select>
        <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Priority</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <button onClick={locateUser} disabled={locating}
          className="ml-auto flex items-center gap-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium disabled:opacity-50">
          <FiNavigation size={14} className={locating ? 'animate-spin' : ''} />
          {locating ? 'Locating...' : 'My Location'}
        </button>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-wrap gap-x-5 gap-y-1.5 items-center text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-400">Status:</span>
        {Object.entries(STATUS_COLORS).map(([key, color]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }}></span>
            <span className="capitalize text-gray-700 dark:text-gray-300">{key.replace('_', ' ')}</span>
          </span>
        ))}
        <span className="text-gray-400 hidden sm:inline">·</span>
        <span className="font-semibold text-gray-600 dark:text-gray-400">Size = Priority</span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
          <FiInfo size={16} className="mt-0.5 shrink-0" />
          <div>
            <strong>Backend offline:</strong> {error}
            <button onClick={fetchComplaints} className="ml-3 underline font-medium hover:no-underline">Retry</button>
          </div>
        </div>
      )}

      {/* MAP VIEW */}
      {view === 'map' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm" style={{ height: 580 }}>
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map data...</p>
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {userLocation && (
                <>
                  <FlyTo position={userLocation} />
                  <Circle center={userLocation} radius={200}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2 }} />
                  <Marker position={userLocation}>
                    <Popup><strong>📍 You are here</strong></Popup>
                  </Marker>
                </>
              )}
              {filtered.map(c => (
                <CircleMarker
                  key={c.id}
                  center={[c.latitude, c.longitude]}
                  radius={PRIORITY_RADIUS[c.priority] || 8}
                  pathOptions={{
                    fillColor: STATUS_COLORS[c.status] || '#6b7280',
                    fillOpacity: 0.85,
                    color: '#ffffff',
                    weight: 2,
                  }}
                  eventHandlers={{ click: () => setSelectedComplaint(c) }}
                >
                  <Popup minWidth={220}>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{CATEGORY_EMOJI[c.category] || '📌'}</span>
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {c.ticket_id || c.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 leading-tight">{c.title}</p>
                      <p className="text-gray-600">📂 {c.category}</p>
                      <p className="text-gray-600">
                        Priority: <span className="font-semibold capitalize">{c.priority}</span>
                      </p>
                      <p className="text-gray-600">
                        Status: <span className="font-semibold capitalize">{(c.status || '').replace('_', ' ')}</span>
                      </p>
                      {c.address && <p className="text-gray-600">📍 {c.address}</p>}
                      <p className="text-gray-600">👍 {c.upvotes || 0} supporters</p>
                      <Link to={`/complaint/${c.id}`}
                        className="inline-block mt-2 text-indigo-600 font-semibold text-xs hover:underline">
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              <FiMapPin size={32} className="mx-auto mb-2 opacity-40" />
              <p>No complaints match the selected filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[580px] overflow-y-auto">
              {filtered.map(c => (
                <Link key={c.id} to={`/complaint/${c.id}`}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span
                    className="mt-1 w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[c.status] || '#6b7280' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base">{CATEGORY_EMOJI[c.category] || '📌'}</span>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{c.title}</p>
                      <span className="ml-auto text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {c.ticket_id || c.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{(c.status || '').replace('_', ' ')}</span>
                      <span className="capitalize">{c.priority}</span>
                      {c.address && <span>📍 {c.address}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-center text-xs text-gray-400 dark:text-gray-500">
        Showing <strong>{filtered.length}</strong> of <strong>{complaints.length}</strong> issues
        {complaints.length > 0 && !loading && ' · Bangalore Metropolitan Area'}
      </div>
    </div>
  );
}