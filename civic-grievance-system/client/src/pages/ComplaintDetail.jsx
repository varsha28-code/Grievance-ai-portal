import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiThumbsUp, FiCheckCircle, FiXCircle, FiMapPin, FiClock, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { fetchComplaint, upvoteComplaint, verifyComplaint } from '../api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_LABELS = { registered: 'Registered', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved', reopened: 'Re-opened', verified: 'Verified' };
const PRIORITY_COLORS = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const STATUS_COLORS = { registered: 'badge-registered', assigned: 'badge-assigned', in_progress: 'badge-in_progress', resolved: 'badge-resolved', reopened: 'badge-reopened', verified: 'badge-verified' };

const STATUS_STEPS = ['registered', 'assigned', 'in_progress', 'resolved', 'verified'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint(id).then(data => {
      setComplaint(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleUpvote = async () => {
    const updated = await upvoteComplaint(complaint.id);
    setComplaint(prev => ({ ...prev, ...updated }));
  };

  const handleVerify = async (verified) => {
    const updated = await verifyComplaint(complaint.id, verified);
    setComplaint(prev => ({ ...prev, ...updated }));
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-48"></div><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div></div>;
  if (!complaint) return <div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400 text-lg">Complaint not found</p><button onClick={() => navigate('/track')} className="btn-primary mt-4">Go Back</button></div>;

  const currentStep = STATUS_STEPS.indexOf(complaint.status);

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 font-medium">
        <FiArrowLeft /> Back
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-gray-400">{complaint.ticket_id}</span>
              <span className={`badge ${PRIORITY_COLORS[complaint.priority]}`}>{complaint.priority}</span>
              <span className={`badge ${STATUS_COLORS[complaint.status]}`}>{STATUS_LABELS[complaint.status]}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{complaint.title}</h1>
          </div>
          <button onClick={handleUpvote} className="btn-secondary flex items-center gap-2 self-start">
            <FiThumbsUp /> Support ({complaint.upvotes})
          </button>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">📊 Real-Time Status Tracking</h3>
        <div className="flex items-center justify-between mb-2">
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  i <= currentStep
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-600'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${i <= currentStep ? 'text-primary-700' : 'text-gray-400'}`}>
                  {STATUS_LABELS[step]}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${i < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📝 Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{complaint.description}</p>

            {complaint.image_url && (
              <div className="mt-4">
                <img src={complaint.image_url} alt="Complaint" className="rounded-lg max-h-64 object-cover" />
              </div>
            )}

            {/* AI Classification */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">🤖 AI Classification</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Category: <strong>{complaint.ai_classification || complaint.category}</strong> · 
                Confidence: <strong>{Math.round((complaint.ai_confidence || 0) * 100)}%</strong> · 
                Routed to: <strong>{complaint.department}</strong>
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📋 Activity Timeline</h3>
            <div className="space-y-4">
              {(complaint.history || []).map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${i === complaint.history.length - 1 ? 'bg-primary-600 animate-pulse-dot' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    {i < complaint.history.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1"></div>}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${STATUS_COLORS[entry.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[entry.status] || entry.status}</span>
                      <span className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleString()}</span>
                    </div>
                    {entry.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification */}
          {complaint.status === 'resolved' && !complaint.citizen_verified && (
            <div className="card border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Verify Resolution</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">This complaint has been marked as resolved. Please verify if the issue has actually been fixed.</p>
              <div className="flex gap-3">
                <button onClick={() => handleVerify(true)} className="btn-success flex items-center gap-2">
                  <FiCheckCircle /> Yes, Issue Resolved
                </button>
                <button onClick={() => handleVerify(false)} className="btn-danger flex items-center gap-2">
                  <FiXCircle /> No, Still Not Fixed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📌 Details</h3>
            <div className="space-y-3 text-sm">
              <InfoRow icon={FiClock} label="Reported" value={new Date(complaint.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
              <InfoRow icon={FiMapPin} label="Location" value={complaint.address || 'Not provided'} />
              <InfoRow label="Category" value={complaint.category} />
              <InfoRow label="Department" value={complaint.department} />
              <InfoRow label="Merged Reports" value={complaint.merged_count || 0} />
              {complaint.resolved_at && <InfoRow label="Resolved on" value={new Date(complaint.resolved_at).toLocaleDateString()} />}
            </div>
          </div>

          {/* Officer */}
          {complaint.officer && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">👤 Assigned Officer</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                  {complaint.officer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{complaint.officer.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{complaint.officer.department}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-1"><FiMail size={14} /> {complaint.officer.email}</p>
              </div>
            </div>
          )}

          {/* Location Map */}
          {complaint.latitude && complaint.longitude && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📍 Location</h3>
              <div className="h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <MapContainer center={[complaint.latitude, complaint.longitude]} zoom={15} className="h-full w-full" scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[complaint.latitude, complaint.longitude]} />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}</p>
            </div>
          )}

          {/* Citizen Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📞 Reporter</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><FiUser size={14} /> {complaint.citizen_name || 'Anonymous'}</p>
              {complaint.citizen_email && <p className="flex items-center gap-2"><FiMail size={14} /> {complaint.citizen_email}</p>}
              {complaint.citizen_phone && <p className="flex items-center gap-2"><FiPhone size={14} /> {complaint.citizen_phone}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">{Icon && <Icon size={14} />}{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
