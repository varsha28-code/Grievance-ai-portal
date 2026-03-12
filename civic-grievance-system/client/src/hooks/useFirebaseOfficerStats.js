import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useFirebaseOfficerStats() {
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Get all officers from users collection
    const usersRef = collection(db, 'users');
    const officerQuery = query(usersRef, where('role', '==', 'officer'));

    const unsubscribeUsers = onSnapshot(officerQuery, (userSnapshot) => {
      const officerProfiles = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 2. For each officer, we need their complaints. 
      // Instead of N queries, we'll listen to ALL complaints and aggregate on-client
      const complaintsRef = collection(db, 'complaints');
      
      const unsubscribeComplaints = onSnapshot(complaintsRef, (complaintSnapshot) => {
        const allComplaints = complaintSnapshot.docs.map(doc => doc.data());
        
        const updatedOfficers = officerProfiles.map(officer => {
          const officerComplaints = allComplaints.filter(c => c.assignedOfficer === officer.name || c.assignedOfficerId === officer.id);
          const resolved = officerComplaints.filter(c => c.status === 'resolved').length;
          const pending = officerComplaints.filter(c => !['resolved', 'verified'].includes(c.status)).length;
          
          return {
            ...officer,
            total_assigned: officerComplaints.length,
            resolved,
            pending,
            avg_resolution_days: 0 // In a production app, we'd calculate this properly
          };
        });

        setOfficers(updatedOfficers);
        setIsLoading(false);
      }, (error) => {
        console.error("Complaints Stats Error:", error);
        setIsLoading(false);
      });

      return () => unsubscribeComplaints();
    }, (error) => {
      console.error("Officer Profiles Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribeUsers();
  }, []);

  return { officers, isLoading };
}
