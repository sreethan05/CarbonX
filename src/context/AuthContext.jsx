import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, AuthError } from '../services/api';

const AuthContext = createContext(null);

function normalizeRole(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['fpo officer', 'fpo/cooperative', 'cooperative'].includes(normalized)) return 'fpo';
  if (['corporate', 'corporate buyer'].includes(normalized)) return 'buyer';
  return ['farmer', 'fpo', 'verifier', 'admin', 'buyer'].includes(normalized) ? normalized : 'farmer';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('carbonx_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('carbonx_token') || null);
  const [farms, setFarms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('carbonx_farms') || '[]'); } catch { return []; }
  });
  const [kyc, setKyc] = useState(() => {
    try { return JSON.parse(localStorage.getItem('carbonx_kyc') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (token) refreshUser();
  }, [token]);

  function _clearStorage() {
    localStorage.removeItem('carbonx_token');
    localStorage.removeItem('carbonx_user');
    localStorage.removeItem('carbonx_farms');
    localStorage.removeItem('carbonx_kyc');
  }

  async function refreshUser() {
    try {
      setLoading(true);
      const data = await getMe();
      if (data.success) {
        setUser(data.user);
        setFarms(data.farms || []);
        setKyc(data.kyc || null);
        localStorage.setItem('carbonx_user', JSON.stringify(data.user));
        localStorage.setItem('carbonx_farms', JSON.stringify(data.farms || []));
        localStorage.setItem('carbonx_kyc', JSON.stringify(data.kyc || null));
        if (data.user?.preferred_language) {
          localStorage.setItem('carbonx_lang', data.user.preferred_language);
        }
      }
    } catch (e) {
      if (e instanceof AuthError) {
        // Token is expired or invalid — clear everything and show a message
        _clearStorage();
        setToken(null);
        setUser(null);
        setFarms([]);
        setKyc(null);
        setSessionExpired(true);
      } else {
        console.warn('Could not refresh user:', e);
      }
    } finally {
      setLoading(false);
    }
  }

  async function login(tokenValue, userData) {
    setSessionExpired(false);
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('carbonx_token', tokenValue);
    localStorage.setItem('carbonx_user', JSON.stringify(userData));
    if (userData?.preferred_language) {
      localStorage.setItem('carbonx_lang', userData.preferred_language);
    }
    try {
      const data = await getMe();
      if (data.success) {
        setUser(data.user);
        setFarms(data.farms || []);
        setKyc(data.kyc || null);
        localStorage.setItem('carbonx_user', JSON.stringify(data.user));
        localStorage.setItem('carbonx_farms', JSON.stringify(data.farms || []));
        localStorage.setItem('carbonx_kyc', JSON.stringify(data.kyc || null));
        if (data.user?.preferred_language) {
          localStorage.setItem('carbonx_lang', data.user.preferred_language);
        }
      }
    } catch (e) {
      if (e instanceof AuthError) {
        _clearStorage();
        setToken(null);
        setUser(null);
        setFarms([]);
        setKyc(null);
        setSessionExpired(true);
      } else {
        // Keep the locally cached user when the backend is temporarily unavailable.
      }
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    setFarms([]);
    setKyc(null);
    setSessionExpired(false);
    _clearStorage();
  }

  function addFarm(farm) {
    const updated = [farm, ...farms.filter((f) => f.id !== farm.id)];
    setFarms(updated);
    localStorage.setItem('carbonx_farms', JSON.stringify(updated));
  }

  function setUserProfile(profile) {
    setUser(profile);
    localStorage.setItem('carbonx_user', JSON.stringify(profile));
  }

  function clearSessionExpired() {
    setSessionExpired(false);
  }

  const role = normalizeRole(user?.role);
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user, token, farms, kyc, role, isAuthenticated, loading, sessionExpired,
      login, logout, addFarm, refreshUser, setUserProfile, clearSessionExpired,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
