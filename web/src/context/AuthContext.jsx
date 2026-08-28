'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check for saved token, validate it, restore session
  useEffect(() => {
    async function initAuth() {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('investiq_token') : null;
      if (savedToken) {
        setToken(savedToken);
        try {
          const res = await api.getProfile();
          if (res && res.user) {
            setUser(res.user);
          } else {
            // Token invalid — clear it
            localStorage.removeItem('investiq_token');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.warn('Session expired:', err.message);
          localStorage.removeItem('investiq_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  // Refresh user profile (e.g. after a trade updates cash balance)
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.getProfile();
      if (res && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      // silent
    }
  }, []);

  useEffect(() => {
    window.addEventListener('portfolio-updated', refreshUser);
    return () => window.removeEventListener('portfolio-updated', refreshUser);
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res && res.token && res.user) {
      localStorage.setItem('investiq_token', res.token);
      setToken(res.token);
      setUser(res.user);
      window.dispatchEvent(new Event('portfolio-updated'));
      return res.user;
    }
    throw new Error(res?.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res && res.token && res.user) {
      localStorage.setItem('investiq_token', res.token);
      setToken(res.token);
      setUser(res.user);
      window.dispatchEvent(new Event('portfolio-updated'));
      return res.user;
    }
    throw new Error(res?.error || 'Registration failed');
  };

  const guestLogin = async () => {
    const res = await api.guestLogin();
    if (res && res.token && res.user) {
      localStorage.setItem('investiq_token', res.token);
      setToken(res.token);
      setUser(res.user);
      window.dispatchEvent(new Event('portfolio-updated'));
      return res.user;
    }
    throw new Error(res?.error || 'Demo login failed');
  };

  const logout = () => {
    localStorage.removeItem('investiq_token');
    setToken(null);
    setUser(null);
    // No redirect — the auth gate will show the login screen automatically
  };

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('investiq-unauthorized', onUnauthorized);
    return () => window.removeEventListener('investiq-unauthorized', onUnauthorized);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        guestLogin,
        logout,
        refreshUser,
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
