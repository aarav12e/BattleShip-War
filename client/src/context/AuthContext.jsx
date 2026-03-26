import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify stored token on app load
  useEffect(() => {
    const token = localStorage.getItem('bsw_token');
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (token) => {
    try {
      const { data } = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...data, token });
    } catch {
      localStorage.removeItem('bsw_token');
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = (token) => {
    localStorage.setItem('bsw_token', token);
    fetchMe(token);
  };

  const logout = () => {
    localStorage.removeItem('bsw_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
