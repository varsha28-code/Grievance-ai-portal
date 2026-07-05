import { useState, useEffect } from 'react';

/**
 * Custom hook to calculate Dashboard metrics in real-time
 * using the local SQLite API endpoints with polling.
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
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch('/api/analytics/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await response.json();
        
        if (active) {
          const overview = data.overview || {};
          const resolved = overview.resolved || 0;
          const total = overview.total || 0;
          const activeComplaints = total - resolved;

          setStats({
            total: total,
            registered: overview.registered || 0,
            assigned: overview.assigned || 0,
            inProgress: overview.inProgress || 0,
            resolved: resolved,
            critical: overview.critical || 0,
            active: activeComplaints,
            resolutionRate: data.resolutionRate || 0,
            avgResolutionDays: data.avgResolutionDays || 0,
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        if (active) {
          setStats(prev => ({ ...prev, isLoading: false }));
        }
      }
    }

    loadStats();
    // Poll every 10 seconds for real-time live data
    const timer = setInterval(loadStats, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return stats;
}
