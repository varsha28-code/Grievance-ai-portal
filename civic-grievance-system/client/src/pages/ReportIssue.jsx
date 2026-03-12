import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiMapPin, FiSend, FiCheckCircle, FiAlertTriangle, FiMic, FiX } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { createComplaint } from '../api';

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CATEGORIES = [
  { value: '', label: 'Auto-detect (AI)', icon: '🤖' },
  { value: 'Pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'Garbage', label: 'Garbage / Waste', icon: '🗑️' },
  { value: 'Streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'Water Leakage', label: 'Water Leakage', icon: '💧' },
  { value: 'Drainage', label: 'Drainage / Sewage', icon: '🚰' },
  { value: 'Road Damage', label: 'Road Damage', icon: '🛤️' },
  { value: 'Encroachment', label: 'Encroachment', icon: '🏗️' },
  { value: 'Public Safety', label: 'Public Safety Hazard', icon: '⚠️' },
];

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '', description: '', category: '', address: '',
    citizen_name: '', citizen_phone: '', citizen_email: '',
  });
  const [position, setPosition] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setPosition([12.9716, 77.5946]), // Default to Bangalore
      );
    } else {
      setPosition([12.9716, 77.5946]);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, description: prev.description + ' ' + transcript }));
    };
    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setError('Please provide a title and description.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });
      if (position) {
        formData.append('latitude', position[0]);
        formData.append('longitude', position[1]);
      }
      if (imageFile) formData.append('image', imageFile);

      const data = await createComplaint(formData);
      setResult(data);
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="card text-center py-12">
          {result.merged ? (
            <>
              <FiAlertTriangle className="mx-auto text-amber-500 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Duplicate Detected & Merged</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{result.message}</p>
              <p className="text-lg font-mono text-primary-600 mb-6">Existing Ticket: {result.existingTicket}</p>
            </>
          ) : (
            <>
              <FiCheckCircle className="mx-auto text-civic-500 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complaint Registered!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Your complaint has been submitted successfully.</p>
              <p className="text-lg font-mono text-primary-600 mb-2">Ticket ID: {result.complaint.ticket_id}</p>
              {result.classification && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg inline-block">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    🤖 AI Classification: <strong>{result.classification.category}</strong> ({Math.round(result.classification.confidence * 100)}% confidence)
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Routed to: <strong>{result.classification.department}</strong>
                  </p>
                </div>
              )}
            </>
          )}
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => navigate(`/complaint/${result.complaint?.id || result.existingTicket}`)} className="btn-primary">
              View Complaint
            </button>
            <button onClick={() => { setResult(null); setForm({ title: '', description: '', category: '', address: '', citizen_name: '', citizen_phone: '', citizen_email: '' }); setImagePreview(null); setImageFile(null); setPosition(null); }} className="btn-secondary">
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report a Civic Issue</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Help improve your city by reporting infrastructure problems. Our AI will classify and route your complaint automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📝 Issue Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Large pothole on MG Road" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                    <button type="button" onClick={handleVoiceInput} className={`ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isListening ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:bg-gray-200 dark:hover:bg-gray-600`}>
                      <FiMic size={12} /> {isListening ? 'Listening...' : 'Voice'}
                    </button>
                  </label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the issue in detail..." rows={4} className="input-field resize-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input-field">
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address / Landmark</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="e.g., Near City Bus Stop, MG Road" className="input-field" />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">👤 Your Details (Optional)</h3>
              <div className="space-y-3">
                <input name="citizen_name" value={form.citizen_name} onChange={handleChange} placeholder="Full Name" className="input-field" />
                <input name="citizen_phone" value={form.citizen_phone} onChange={handleChange} placeholder="Phone Number" className="input-field" />
                <input name="citizen_email" value={form.citizen_email} onChange={handleChange} placeholder="Email Address" type="email" className="input-field" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📷 Upload Photo</h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Click to upload or drag & drop</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">JPG, PNG up to 10MB</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">📌 Our AI analyzes uploaded images to help classify the issue automatically.</p>
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">📍 Mark Location</h3>
                <button type="button" onClick={handleGetLocation} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  <FiMapPin size={14} /> Use my location
                </button>
              </div>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <MapContainer
                  center={position || [12.9716, 77.5946]}
                  zoom={13}
                  className="h-full w-full"
                  key={position ? position.join(',') : 'default'}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click on the map to mark the exact location of the issue.</p>
              {position && (
                <p className="text-xs text-primary-600 mt-1">📍 Location: {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? (
              <>⏳ Analyzing & Submitting...</>
            ) : (
              <><FiSend size={16} /> Submit Complaint</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
