import { useState, useEffect } from 'react';

export function useFirebaseOfficerStats() {
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadOfficerStats() {
      try {
        const response = await fetch('/api/analytics/officers');
        if (!response.ok) throw new Error('Failed to fetch officer stats');
        const data = await response.json();
        
        if (active) {
          setOfficers(data || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading officer stats:", error);
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadOfficerStats();
    const timer = setInterval(loadOfficerStats, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { officers, isLoading };
}
