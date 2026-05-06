import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  }, []);

  const signup = useCallback(async (username, email, password) => {
    try {
      const { data } = await axios.post(`${API}/auth/signup`, { username, email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Signup failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch(`${API}/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Profile update failed' };
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
