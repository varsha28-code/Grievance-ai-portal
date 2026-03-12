import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  increment, 
  arrayUnion,
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { classifyComplaint, calculatePriority } from './ai/classifier';

export async function fetchComplaints(params = {}) {
  try {
    const complaintsRef = collection(db, 'complaints');
    let q = query(complaintsRef);

    if (params.status) {
      q = query(q, where('status', '==', params.status));
    }
    
    if (params.category) {
      q = query(q, where('category', '==', params.category));
    }

    if (params.sort === 'priority') {
      q = query(q, orderBy('priority', 'desc'));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    if (params.limit) {
      q = query(q, firestoreLimit(parseInt(params.limit)));
    }

    const snapshot = await getDocs(q);
    const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return { complaints, total: complaints.length };
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return { complaints: [], total: 0 };
  }
}

export async function fetchComplaint(id) {
  try {
    const docRef = doc(db, 'complaints', id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return null;
  }
}

export async function createComplaint(formData) {
  try {
    // Extract data from FormData (passed from ReportIssue.jsx)
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const address = formData.get('address');
    const lat = parseFloat(formData.get('latitude'));
    const lng = parseFloat(formData.get('longitude'));
    const image = formData.get('image');
    const userId = formData.get('userId');

    // 1. AI Classification (Frontend)
    const classification = classifyComplaint(title, description);
    const priority = calculatePriority(classification, 0);

    // 2. Upload Image if exists
    let imageUrl = '';
    if (image && image.size > 0) {
      const storageRef = ref(storage, `complaints/${Date.now()}_${image.name}`);
      const uploadResult = await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(uploadResult.ref);
    }

    // 3. Save to Firestore
    const ticketId = 'CR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const complaintData = {
      ticket_id: ticketId,
      title,
      description,
      category: category || classification.category,
      department: classification.department,
      priority,
      status: 'registered',
      address,
      latitude: lat,
      longitude: lng,
      image_url: imageUrl,
      upvotes: 0,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{
        status: 'registered',
        notes: 'Complaint registered.',
        created_at: new Date().toISOString()
      }]
    };

    const docRef = await addDoc(collection(db, 'complaints'), complaintData);
    
    // Return structure that ReportIssue expects
    return { 
      id: docRef.id, 
      complaint: { id: docRef.id, ...complaintData },
      classification: { 
        category: complaintData.category,
        confidence: classification.confidence,
        department: complaintData.department
      },
      merged: false // Duplicate detection logic can be added later if needed
    };
  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
}

export async function updateComplaintStatus(id, status, notes) {
  try {
    const docRef = doc(db, 'complaints', id);
    const historyEntry = {
      status,
      notes,
      created_at: new Date().toISOString()
    };
    
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
      lastNotes: notes,
      history: arrayUnion(historyEntry)
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, error: error.message };
  }
}

export async function upvoteComplaint(id) {
  try {
    const docRef = doc(db, 'complaints', id);
    await updateDoc(docRef, {
      upvotes: increment(1)
    });
    return { success: true };
  } catch (error) {
    console.error("Error upvoting:", error);
    return { success: false };
  }
}

export async function verifyComplaint(id, verified) {
  try {
    const docRef = doc(db, 'complaints', id);
    const status = verified ? 'verified' : 'reopened';
    const notes = verified ? 'Citizen verified the fix.' : 'Citizen reported the issue as still not fixed.';
    const historyEntry = {
      status,
      notes,
      created_at: new Date().toISOString()
    };

    await updateDoc(docRef, {
      status,
      citizen_verified: verified,
      updatedAt: new Date().toISOString(),
      lastNotes: notes,
      history: arrayUnion(historyEntry)
    });
    return { success: true };
  } catch (error) {
    console.error("Error verifying:", error);
    return { success: false };
  }
}

export async function fetchMapData() {
  // Same as fetching all complaints but specifically for the map
  const res = await fetchComplaints({ limit: 100 });
  return res.complaints;
}

export async function fetchDashboardStats() {
  // For the legacy dashboard component that still uses this function
  const res = await fetchComplaints();
  const complaints = res.complaints;
  
  const stats = {
    total: complaints.length,
    registered: complaints.filter(c => c.status === 'registered').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    critical: complaints.filter(c => c.priority === 'critical').length,
  };
  
  return stats;
}

export async function fetchOfficerPerformance() {
  // Mocking officer performance from Firestore data would be complex to aggregate 
  // without a server, but for now we'll return an empty array or basic aggregation.
  // In a real app, you'd query the users collection where role=officer.
  return [];
}

export async function fetchHotspots() {
  // Simple aggregation for UI hotspots
  return [];
}

export async function sendChatMessage(message) {
  // Keeping this as a mock for now as it's pure logic
  return { 
    reply: "I've analyzed your message. How can I help you regarding civic issues today?",
    suggestions: ["Report Garbage", "Check Pothole Status", "Contact Admin"]
  };
}
