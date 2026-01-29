import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import { clearStoredToken, getStoredToken, setStoredToken } from './tokenStorage';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: String(user.id),
    email: user.email || '',
    name: user.name || '',
    role: user.role || '',
  };
}

/**
 * PUBLIC_INTERFACE
 * React provider that manages auth state via backend JWT endpoints:
 * - POST /auth/register
 * - POST /auth/login
 * - GET /auth/me
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // bootstrapping /auth/me

  const bootstrap = useCallback(async (existingToken) => {
    if (!existingToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/auth/me', { token: existingToken });
      setUser(normalizeUser(data?.user));
    } catch {
      // Token invalid/expired; clear and continue as logged out
      clearStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap(token);
  }, [bootstrap, token]);

  // PUBLIC_INTERFACE
  const login = useCallback(async ({ email, password }) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (!data?.token) {
      throw new Error('Login failed: missing token');
    }

    setStoredToken(data.token);
    setToken(data.token);
    setUser(normalizeUser(data.user));
    return data;
  }, []);

  // PUBLIC_INTERFACE
  const register = useCallback(async ({ name, email, password }) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });

    if (!data?.token) {
      throw new Error('Registration failed: missing token');
    }

    // Backend returns token + user; treat as logged-in after signup
    setStoredToken(data.token);
    setToken(data.token);
    setUser(normalizeUser(data.user));
    return data;
  }, []);

  // PUBLIC_INTERFACE
  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access auth state/actions.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
