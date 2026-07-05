import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user session from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to sign in. Please verify your credentials.');
    }

    const mappedUser = {
      uid: data.user.id,
      ...data.user,
    };

    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('token', data.token);
    setUser(mappedUser);
  };

  const register = async (email, password, additionalData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name: additionalData.name,
        phone: additionalData.phone,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to register account.');
    }

    const mappedUser = {
      uid: data.user.id,
      ...data.user,
    };

    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('token', data.token);
    setUser(mappedUser);
  };

  const logout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const isCitizen = user?.role === 'citizen' || !user?.role;
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
