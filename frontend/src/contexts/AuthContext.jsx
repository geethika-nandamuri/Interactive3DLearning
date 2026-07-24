import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, updateProfileApi, forgotPasswordApi } from '@services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse cached user credentials:', e.message);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe) => {
    const data = await loginApi(email, password);
    if (data.success && data.token && data.user) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setUser(data.user);
      return data;
    }
    throw new Error('Invalid authentication response.');
  };

  const register = async (name, email, password) => {
    const data = await registerApi(name, email, password);
    if (data.success && data.token && data.user) {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    }
    throw new Error('Invalid registration response.');
  };

  const updateProfile = async (userData) => {
    const data = await updateProfileApi(userData);
    if (data.success && data.user && data.token) {
      const isLocal = localStorage.getItem('token') !== null;
      const storage = isLocal ? localStorage : sessionStorage;

      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    }
    throw new Error('Invalid profile update response.');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return await forgotPasswordApi(email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout, forgotPassword }}>
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
