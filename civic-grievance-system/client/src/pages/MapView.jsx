import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiNavigation, FiRefreshCw, FiMapPin, FiFilter, FiInfo, FiList, FiMap, FiPlusCircle, FiCheckCircle } from 'react-icons/fi';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const API_BASE = 'http://localhost:3001/api';
const CITY_CENTER = [12.9716, 77.5946]; // Bangalore
const POLL_INTERVAL = 5000; // 5-second live refresh

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


function FlyTo({ position, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom, { duration: 1.5 });
  }, [position, zoom, map]);
  return null;
}

// Pulsing CSS-based Leaflet icon for newly-submitted marker
function makePulseIcon(color = '#3b82f6') {
  return L.divIcon({
    className: '',
    iconAnchor: [18, 18],
    html: `
      <div style="position:relative;width:36px;height:36px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.25;
          animation:pulse-ring 1.4s ease-out infinite;"></div>
        <div style="position:absolute;inset:6px;border-radius:50%;background:${color};border:3px solid white;
          box-shadow:0 0 0 2px ${color};"></div>
      </div>
      <style>
        @keyframes pulse-ring{
          0%{transform:scale(1);opacity:.4}
          80%,100%{transform:scale(2.4);opacity:0}
        }
      </style>`,
  });
}

export default function MapView() {
  const navigate = useNavigate();
  const { state: navState } = useLocation();
  // navState may have { newComplaintId, lat, lng } when coming from ReportIssue
  const highlightId = navState?.newComplaintId || null;
  const highlightPos = (navState?.lat && navState?.lng) ? [navState.lat, navState.lng] : null;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [view, setView] = useState('map');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const [flyTarget, setFlyTarget] = useState(highlightPos); // zoom destination
  const prevIdsRef = useRef(new Set());

  const fetchComplaints = useCallback(async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const params = new URLSearchParams({ limit: 500 });
      if (filters.status)   params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      const res = await fetch(`${API_BASE}/complaints?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      // Only keep complaints that have real submitted coordinates
      const withCoords = (data.complaints || []).filter(
        c => c.latitude != null && c.longitude != null
      );
      // Detect newly appeared markers since last poll
      const newIds = withCoords.map(c => c.id);
      const added = newIds.filter(id => !prevIdsRef.current.has(id));
      if (prevIdsRef.current.size > 0 && added.length > 0) {
        setNewCount(n => n + added.length);
        setTimeout(() => setNewCount(0), 4000);
      }
      prevIdsRef.current = new Set(newIds);
      setComplaints(withCoords);
      setLastUpdated(new Date());
      setError('');
      // If we arrived from ReportIssue with a highlight id and the complaint just loaded, fly to it
      if (highlightId) {
        const target = withCoords.find(c => c.id === highlightId);
        if (target) setFlyTarget([target.latitude, target.longitude]);
      }
    } catch (err) {
      setError('Could not load complaints. Make sure the backend server is running on port 3001.');
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  }, [filters]);

  // Initial fetch + live polling every 5 s
  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(() => fetchComplaints(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

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

  const mapCenter = flyTarget || userLocation || CITY_CENTER;

  return (
    <div className="animate-fadeIn space-y-4">
      {/* New complaint flash toast */}
      {(newCount > 0 || highlightId) && complaints.find(c => c.id === highlightId) && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold">
          <FiCheckCircle size={18} />
          <div>
            <div>Your complaint is now live on the map!</div>
            <div className="text-green-100 text-xs font-normal mt-0.5">Pulsing marker shows your report location</div>
          </div>
        </div>
      )}
      {newCount > 0 && !highlightId && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold">
          <FiMapPin size={16} />
          +{newCount} new complaint{newCount > 1 ? 's' : ''} appeared on map!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiMapPin className="text-indigo-500" /> City Issue Map
          </h2>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {loading ? 'Loading...' : filtered.length === 0 ? 'No issues pinned yet — submit a complaint to add a marker' : `${filtered.length} issue${filtered.length !== 1 ? 's' : ''} pinned on map`}
            </p>
            {/* Live pulse indicator */}
            {!loading && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/report')}
            className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors font-medium shadow-sm">
            <FiPlusCircle size={15} /> Report Issue
          </button>
          <button onClick={() => setView(v => v === 'map' ? 'list' : 'map')}
            className="flex items-center gap-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-200">
            {view === 'map' ? <><FiList size={15}/> List View</> : <><FiMap size={15}/> Map View</>}
          </button>
          <button onClick={() => fetchComplaints(false)} disabled={refreshing}
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
        {lastUpdated && (
          <span className="ml-auto text-gray-400 text-xs">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
          <FiInfo size={16} className="mt-0.5 shrink-0" />
          <div>
            <strong>Backend offline:</strong> {error}
            <button onClick={() => fetchComplaints(false)} className="ml-3 underline font-medium hover:no-underline">Retry</button>
          </div>
        </div>
      )}

      {/* MAP VIEW */}
      {view === 'map' && (
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm" style={{ height: 580 }}>
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map data...</p>
            </div>
          ) : (
            <>
            {/* Empty state overlay — map tiles still visible behind */}
            {filtered.length === 0 && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl px-8 py-7 flex flex-col items-center gap-3 max-w-sm text-center pointer-events-auto">
                  <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <FiMapPin size={26} className="text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">No complaints pinned yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    The map is live. Submit a complaint with your location and it will appear as a marker instantly.
                  </p>
                  <button
                    onClick={() => navigate('/report')}
                    className="mt-1 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-md"
                  >
                    <FiPlusCircle size={16} /> Report an Issue
                  </button>
                </div>
              </div>
            )}
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {/* Fly to the newly submitted complaint */}
              {flyTarget && <FlyTo position={flyTarget} zoom={15} />}
              {userLocation && !flyTarget && (
                <>
                  <FlyTo position={userLocation} />
                  <Circle center={userLocation} radius={200}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2 }} />
                  <Marker position={userLocation}>
                    <Popup><strong>📍 You are here</strong></Popup>
                  </Marker>
                </>
              )}
              {filtered.map(c => {
                const isNew = c.id === highlightId;
                if (isNew) {
                  return (
                    <Marker
                      key={c.id}
                      position={[c.latitude, c.longitude]}
                      icon={makePulseIcon(STATUS_COLORS[c.status] || '#3b82f6')}
                    >
                      <Popup minWidth={220} autoPan>
                        <div className="text-sm space-y-1">
                          <div className="font-bold text-green-700 text-xs mb-1">✅ Just submitted by you!</div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{CATEGORY_EMOJI[c.category] || '📌'}</span>
                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {c.ticket_id || c.id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="font-bold text-gray-900 leading-tight">{c.title}</p>
                          <p className="text-gray-600">📂 {c.category}</p>
                          <p className="text-gray-600">Priority: <span className="font-semibold capitalize">{c.priority}</span></p>
                          <p className="text-gray-600">Status: <span className="font-semibold">Registered</span></p>
                          {c.address && <p className="text-gray-600">📍 {c.address}</p>}
                          <Link to={`/complaint/${c.id}`} className="inline-block mt-2 text-indigo-600 font-semibold text-xs hover:underline">
                            View Details →
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return (
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
                );
              })}
            </MapContainer>
            </>
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