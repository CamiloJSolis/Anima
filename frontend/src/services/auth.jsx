// /frontend/src/services/auth.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { apiGetMe, apiLogout } from "./api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Se ejecuta una vez al montar: intenta recuperar la sesión del backend
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGetMe(); // GET /auth/me
        if (!alive) return;
        if (data?.user) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        if (!alive) return;
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try { await apiLogout(); } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
