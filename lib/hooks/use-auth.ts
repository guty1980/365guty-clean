
'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  isAdmin: boolean;
  allowedDevices: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (showErrors = false) => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null, // No mostrar error automático en verificación inicial
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: showErrors ? 'Error verificando autenticación' : null, // Solo mostrar error si se solicita explícitamente
      });
    }
  };

  const login = async (password: string, deviceId?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        });
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error,
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = 'Error al iniciar sesión';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    refreshAuth: (showErrors = true) => checkAuthStatus(showErrors), // Por defecto mostrar errores cuando se llama manualmente
  };
}
