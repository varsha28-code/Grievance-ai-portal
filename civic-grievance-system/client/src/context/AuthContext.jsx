import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Failsafe: Set loading to false after 2 seconds even if onAuthStateChanged doesn't fire
    // This prevents the white screen if Firebase fails due to dummy keys
    const fallbackTimeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(fallbackTimeout);
      if (firebaseUser) {
        try {
          // Fetch custom user data (role, etc.) from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() });
          } else {
            // Fallback if no doc exists (like right after registration before doc is written)
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'citizen' });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'citizen' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, additionalData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    // Store user profile in Firestore
    await setDoc(doc(db, 'users', uid), {
      email,
      ...additionalData,
      createdAt: new Date().toISOString()
    });
    // Update local user state immediately to include the role
    setUser({ uid, email, ...additionalData });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const isCitizen = user?.role === 'citizen' || !user?.role; // default
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isOfficer, isCitizen, isLoggedIn }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
