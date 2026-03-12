import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiNavigation } from 'react-icons/fi';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14, { duration: 1.2 });
  }, [position, map]);
  return null;
}

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_COLORS = {
  registered: '#3b82f6',
  assigned: '#8b5cf6',
  in_progress: '#f59e0b',
  resolved: '#22c55e',
  reopened: '#ef4444',
};

const PRIORITY_SIZES = {
  critical: 12,
  high: 10,
  medium: 8,
  low: 6,
};

const CATEGORY_ICONS = {
  'Pothole': '🕳️',
  'Garbage': '🗑️',
  'Streetlight': '💡',
  'Water Leakage': '💧',
  'Drainage': '🚰',
  'Road Damage': '🛤️',
  'Encroachment': '🏗️',
  'Public Safety': '⚠️',
};


export default function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    // 1. Real-time Firebase Listener
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, limit(200)); // Reasonable limit for map view

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
      if (loading) setLoading(false);
    }, (error) => {
      console.error("Firestore Map Error:", error);
      setLoading(false);
    });

    // 2. Locate User
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocating(false);
        },
        () => setLocating(false),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocating(false);
    }

    return () => unsubscribe();
  }, []);

  const handleRecenter = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocating(false);
        },
        () => setLocating(false),
        { enableHighAccuracy: true }
      );
    } else {
      setLocating(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.category && c.category !== filters.category) return false;
    if (filters.priority && c.priority !== filters.priority) return false;
    return true;
  });

  const categories = [...new Set(complaints.map(c => c.category))];

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">City Issue Map</h2>
          <p className="text-gray-500 dark:text-gray-400">Real-time visualization of all reported civic issues</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
            <option value="">All Status</option>
            <option value="registered">Registered</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filters.category} onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Legend & Controls */}
      <div className="card mb-4 p-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
          {Object.entries(STATUS_COLORS).map(([key, color]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
              <span className="capitalize">{key.replace('_', ' ')}</span>
            </span>
          ))}
          <span className="text-gray-300 dark:text-gray-600 mx-2 hidden sm:inline">|</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">Size = Priority</span>
        </div>
        <button type="button" onClick={handleRecenter} disabled={locating} 
          className="text-sm text-indigo-600 hover:bg-indigo-100 flex items-center gap-1.5 disabled:opacity-50 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-2 rounded-full font-medium transition-colors shadow-sm">
          <FiNavigation size={16} className={locating ? 'animate-spin' : ''} />
          {locating ? 'Locating...' : 'My Location'}
        </button>
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden" style={{ height: '600px' }}>
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">Loading map data...</div>
          </div>
        ) : (
          <MapContainer center={userLocation || [12.9516, 77.5946]} zoom={12} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {userLocation && (
              <>
                <FlyToLocation position={userLocation} />
                <Circle
                  center={userLocation}
                  radius={100}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }}
                />
                <Marker position={userLocation}>
                  <Popup>You are here</Popup>
                </Marker>
              </>
            )}
            {filteredComplaints.map(c => (
              <CircleMarker
                key={c.id}
                center={[c.latitude, c.longitude]}
                radius={PRIORITY_SIZES[c.priority] || 8}
                fillColor={STATUS_COLORS[c.status] || '#6b7280'}
                fillOpacity={0.8}
                color="#fff"
                weight={2}
              >
                <Popup>
                  <div className="min-w-48">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{CATEGORY_ICONS[c.category] || '📌'}</span>
                      <span className="font-mono text-xs text-gray-500">{c.ticket_id}</span>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{c.title}</h3>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p>📂 {c.category} · Priority: <strong>{c.priority}</strong></p>
                      <p>📊 Status: <strong className="capitalize">{c.status.replace('_', ' ')}</strong></p>
                      <p>📍 {c.address || 'N/A'}</p>
                      <p>👍 {c.upvotes} supporters</p>
                    </div>
                    <Link to={`/complaint/${c.id}`} className="text-primary-600 text-xs font-medium hover:underline mt-2 inline-block">
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Showing {filteredComplaints.length} of {complaints.length} reported issues
      </div>
    </div>
  );
}
