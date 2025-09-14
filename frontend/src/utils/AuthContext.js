import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    async function init() {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          await authAPI.getProfile();
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      setToken(res.data.data.token);
      setUser(res.data.data.user);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const isAuthenticated = () => !!(token && user);
  const hasRole = (role) => user?.role === role;
  const isAdmin = () => hasRole('admin');
  const isMember = () => hasRole('member') || hasRole('admin');

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateUser, isAuthenticated, hasRole, isAdmin, isMember }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
