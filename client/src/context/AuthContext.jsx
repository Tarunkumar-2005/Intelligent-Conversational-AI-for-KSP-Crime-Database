import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verifies token on startup and fetches user profile
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (err) {
      console.error('Session verification failed:', err.message);
      // Remove stale token
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Authenticate user via login endpoint
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(loggedUser);
      setLoading(false);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  // Terminate user session
  const logout = async () => {
    setLoading(true);
    try {
      // Notify backend to log the audit event
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout notification error:', err.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
