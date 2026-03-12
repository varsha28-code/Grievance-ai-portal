import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function useFirebaseAnalytics() {
  const [stats, setStats] = useState({
    byStatus: [],
    byPriority: [],
    byDepartment: [],
    byCategory: [],
    trend: [],
    isLoading: true
  });

  useEffect(() => {
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      
      // 1. Status Distribution
      const statusMap = {};
      docs.forEach(d => {
        statusMap[d.status] = (statusMap[d.status] || 0) + 1;
      });
      const byStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

      // 2. Priority Distribution
      const priorityMap = { critical: 0, high: 0, medium: 0, low: 0 };
      docs.forEach(d => {
        if (priorityMap.hasOwnProperty(d.priority)) {
          priorityMap[d.priority]++;
        }
      });
      const byPriority = Object.entries(priorityMap).map(([priority, count]) => ({ priority, count }));

      // 3. Department Workload
      const deptMap = {};
      docs.forEach(d => {
        const dept = d.department || 'Unassigned';
        if (!deptMap[dept]) deptMap[dept] = { department: dept, resolved: 0, pending: 0 };
        if (d.status === 'resolved') deptMap[dept].resolved++;
        else deptMap[dept].pending++;
      });
      const byDepartment = Object.values(deptMap);

      // 4. Category Distribution
      const catMap = {};
      docs.forEach(d => {
        catMap[d.category] = (catMap[d.category] || 0) + 1;
      });
      const byCategory = Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // 5. Trend (Last 7 Days for simplicity in grouping)
      const trendMap = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendMap[dateStr] = 0;
      }

      docs.forEach(d => {
        const date = new Date(d.createdAt);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (trendMap.hasOwnProperty(dateStr)) {
          trendMap[dateStr]++;
        }
      });
      const trend = Object.entries(trendMap).map(([date, complaints]) => ({ date, complaints }));

      setStats({
        byStatus,
        byPriority,
        byDepartment,
        byCategory,
        trend,
        isLoading: false
      });
    }, (error) => {
      console.error("Analytics Hook Error:", error);
      setStats(prev => ({ ...prev, isLoading: false }));
    });

    return () => unsubscribe();
  }, []);

  return stats;
}
