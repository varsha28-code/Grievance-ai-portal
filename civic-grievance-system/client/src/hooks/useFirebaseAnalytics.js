import { useState, useEffect } from 'react';

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
    let active = true;

    async function loadAnalytics() {
      try {
        const response = await fetch('/api/analytics/dashboard');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();

        if (active) {
          // Format trend dates to "MMM DD" (e.g., "Jun 16")
          const trendFormatted = (data.trend || []).map(t => ({
            date: (() => {
              try {
                const date = new Date(t.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              } catch (e) {
                return t.date;
              }
            })(),
            complaints: t.complaints || 0
          }));

          setStats({
            byStatus: data.byStatus || [],
            byPriority: data.byPriority || [],
            byDepartment: data.byDepartment || [],
            byCategory: data.byCategory || [],
            trend: trendFormatted,
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
        if (active) {
          setStats(prev => ({ ...prev, isLoading: false }));
        }
      }
    }

    loadAnalytics();
    const timer = setInterval(loadAnalytics, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return stats;
}
