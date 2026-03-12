import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure your firebase.js exports 'db'

/**
 * Custom hook to calculate Dashboard metrics in real-time
 * using Firebase Firestore an onSnapshot listener.
 */
export function useFirebaseDashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    active: 0,
    resolutionRate: 0,
    avgResolutionDays: 0,
    isLoading: true
  });

  useEffect(() => {
    // Reference to the complaints collection
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef);

    // Set up the real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      let registered = 0;
      let assigned = 0;
      let inProgress = 0;
      let resolved = 0;
      let critical = 0;
      let totalResolutionDays = 0;

      // Loop through all documents in real-time
      snapshot.forEach((doc) => {
        const data = doc.data();
        total++;

        // 1. Count Statuses
        if (data.status === 'registered') registered++;
        else if (data.status === 'assigned') assigned++;
        else if (data.status === 'in_progress') inProgress++;
        else if (data.status === 'resolved') resolved++;

        // 2. Count Priority
        if (data.priority === 'critical') critical++;

        // 3. Calculate Resolution Time for resolved complaints
        if (data.status === 'resolved' && data.createdAt && data.resolvedAt) {
          // Handle both Firestore Timestamp objects or standard Date strings/seconds
          const created = data.createdAt.toMillis ? data.createdAt.toMillis() : new Date(data.createdAt).getTime();
          const resolved = data.resolvedAt.toMillis ? data.resolvedAt.toMillis() : new Date(data.resolvedAt).getTime();
          
          if (resolved > created) {
            const resolutionDays = (resolved - created) / (1000 * 60 * 60 * 24);
            totalResolutionDays += resolutionDays;
          }
        }
      });

      // 4. Calculate final metrics
      const active = total - resolved;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      
      // Feature Req: Avg Resolution must show 0 when there are no resolved complaints
      const avgResolutionDays = resolved > 0 
        ? parseFloat((totalResolutionDays / resolved).toFixed(1)) 
        : 0;

      // Update state
      setStats({
        total,
        registered,
        assigned,
        inProgress,
        resolved,
        critical,
        active,
        resolutionRate,
        avgResolutionDays,
        isLoading: false
      });
    }, (error) => {
      console.error("Error fetching real-time stats: ", error);
      setStats(prev => ({ ...prev, isLoading: false }));
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return stats;
}
