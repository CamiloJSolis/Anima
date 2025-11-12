// /frontend/src/services/auth.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGetMe, apiLogout } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // carga inicial

  // Cargar sesión al montar
  useEffect(() => {
    (async () => {
      try {
        const me = await apiGetMe();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isAuthenticated = !!user;

  const refreshUser = async () => {
    const me = await apiGetMe();
    setUser(me);
    return me;
  };

  const login = (userData) => {
    // útil si en algún punto haces login con formulario y recibes el user
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    refreshUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
