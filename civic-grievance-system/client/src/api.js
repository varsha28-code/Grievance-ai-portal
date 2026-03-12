const API_BASE = '/api';

export async function fetchComplaints(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/complaints?${query}`);
  return res.json();
}

export async function fetchComplaint(id) {
  const res = await fetch(`${API_BASE}/complaints/${id}`);
  return res.json();
}

export async function createComplaint(formData) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function updateComplaintStatus(id, status, notes) {
  const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });
  return res.json();
}

export async function upvoteComplaint(id) {
  const res = await fetch(`${API_BASE}/complaints/${id}/upvote`, {
    method: 'POST',
  });
  return res.json();
}

export async function verifyComplaint(id, verified) {
  const res = await fetch(`${API_BASE}/complaints/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verified }),
  });
  return res.json();
}

export async function fetchMapData() {
  const res = await fetch(`${API_BASE}/complaints/map/all`);
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/analytics/dashboard`);
  return res.json();
}

export async function fetchOfficerPerformance() {
  const res = await fetch(`${API_BASE}/analytics/officers`);
  return res.json();
}

export async function fetchHotspots() {
  const res = await fetch(`${API_BASE}/analytics/hotspots`);
  return res.json();
}

export async function sendChatMessage(message) {
  const res = await fetch(`${API_BASE}/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return res.json();
}
