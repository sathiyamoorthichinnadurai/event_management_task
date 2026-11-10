import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify existing token on startup
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.customMessage);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Public User (Attendee) login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: jwtToken } = res.data.data;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  // Dedicated Admin login
  const loginAdmin = async (email, password) => {
    const res = await api.post('/auth/login/admin', { email, password });
    const { user: userData, token: jwtToken } = res.data.data;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  // Public user registration (Strictly role: 'user')
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user: userData, token: jwtToken } = res.data.data;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginAdmin,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isUser,
      }}
    >
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
