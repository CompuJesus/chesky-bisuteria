import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getAuthProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chesky_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('chesky_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyStoredAuth = async () => {
      const storedToken = localStorage.getItem('chesky_token');
      if (storedToken) {
        try {
          const profile = await getAuthProfile();
          if (profile.success) {
            setUser(profile.usuario);
            localStorage.setItem('chesky_user', JSON.stringify(profile.usuario));
          }
        } catch (err) {
          console.warn('Sesión expirada o inválida:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyStoredAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.usuario);
      localStorage.setItem('chesky_token', res.token);
      localStorage.setItem('chesky_user', JSON.stringify(res.usuario));
      return { success: true };
    }
    return { success: false, error: res.error || 'Credenciales incorrectas' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('chesky_token');
    localStorage.removeItem('chesky_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.rol === 'ADMIN',
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
