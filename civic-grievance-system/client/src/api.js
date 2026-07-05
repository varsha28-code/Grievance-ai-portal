export async function fetchComplaints(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        queryParams.append(key, val);
      }
    });

    const response = await fetch(`/api/complaints?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return {
      complaints: data.complaints || [],
      total: data.total || 0
    };
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return { complaints: [], total: 0 };
  }
}

export async function fetchComplaint(id) {
  try {
    const response = await fetch(`/api/complaints/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return null;
  }
}

export async function createComplaint(formData) {
  try {
    const response = await fetch('/api/complaints', {
      method: 'POST',
      body: formData, // Send as multipart/form-data
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit complaint');
    }

    return data;
  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
}

export async function updateComplaintStatus(id, status, notes) {
  try {
    const response = await fetch(`/api/complaints/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update status');
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, error: error.message };
  }
}

export async function upvoteComplaint(id) {
  try {
    const response = await fetch(`/api/complaints/${id}/upvote`, {
      method: 'POST',
    });

    if (!response.ok) throw new Error('Failed to upvote');
    return await response.json();
  } catch (error) {
    console.error("Error upvoting:", error);
    return { success: false };
  }
}

export async function verifyComplaint(id, verified) {
  try {
    const response = await fetch(`/api/complaints/${id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verified }),
    });

    if (!response.ok) throw new Error('Failed to verify resolution');
    return await response.json();
  } catch (error) {
    console.error("Error verifying:", error);
    return { success: false };
  }
}

export async function fetchMapData() {
  try {
    const response = await fetch('/api/complaints/map/all');
    if (!response.ok) throw new Error('Failed to fetch map data');
    return await response.json();
  } catch (error) {
    console.error("Error fetching map data:", error);
    return [];
  }
}

export async function fetchDashboardStats() {
  try {
    const response = await fetch('/api/analytics/dashboard');
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    const data = await response.json();
    return data.overview; // Returns overview stats { total, registered, assigned, inProgress, resolved, critical }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { total: 0, registered: 0, assigned: 0, inProgress: 0, resolved: 0, critical: 0 };
  }
}

export async function fetchOfficerPerformance() {
  try {
    const response = await fetch('/api/analytics/officers');
    if (!response.ok) throw new Error('Failed to fetch officer stats');
    return await response.json();
  } catch (error) {
    console.error("Error fetching officer stats:", error);
    return [];
  }
}

export async function fetchHotspots() {
  try {
    const response = await fetch('/api/analytics/hotspots');
    if (!response.ok) throw new Error('Failed to fetch hotspots');
    return await response.json();
  } catch (error) {
    console.error("Error fetching hotspots:", error);
    return [];
  }
}

export async function sendChatMessage(message) {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error('Failed to talk to chat assistant');
    const data = await response.json();
    return {
      reply: data.response,
      suggestions: data.suggestions || []
    };
  } catch (error) {
    console.error("Error sending message to chatbot:", error);
    return {
      reply: "I'm experiencing connectivity issues right now. Please try again in a moment.",
      suggestions: ["Report Issue", "Track Complaint"]
    };
  }
}
