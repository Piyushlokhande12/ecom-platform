import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, onNotify }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then((res) => {
          if (res?.user) setUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    if (onNotify) onNotify(`Welcome back, ${res.user.name}!`, 'success');
    setIsAuthOpen(false);
    return res.user;
  };

  const register = async (name, email, password, role = 'USER') => {
    const res = await api.register(name, email, password, role);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    if (onNotify) onNotify('Account created! Welcome to Lumina.', 'success');
    setIsAuthOpen(false);
    return res.user;
  };

  const quickDemoLogin = async (role) => {
    const email = role === 'ADMIN' ? 'admin@store.com' : 'customer@store.com';
    const password = role === 'ADMIN' ? 'adminpassword123' : 'customerpassword123';
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (onNotify) onNotify('Signed out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthOpen,
        setIsAuthOpen,
        login,
        register,
        quickDemoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
