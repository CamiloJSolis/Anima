import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from './api'; // Reactivamos la API

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // --- 1. Estado inicial (vuelve a la normalidad) ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Vuelve a 'true'

  // --- 2. useEffect (REACTIVADO) ---
  // Esto buscará una sesión real en el backend al cargar la app
  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        if (res.data?.user) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        }
      })
      .catch(() => {
        // Si hay error (no token, token inválido), se asegura de estar deslogueado
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        // Pase lo que pase, marca la carga como terminada
        setIsLoading(false);
      });
  }, []); // El array vacío [] significa que solo se ejecuta 1 vez al inicio


  // Funciones de login y logout (sin cambios)
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Aquí puedes añadir la lógica para guardar el token si tu backend lo usa
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Aquí puedes añadir la lógica para borrar el token
  };

  // --- 3. Pantalla de Carga (REACTIVADA) ---
  // Muestra "Cargando..." mientras el useEffect de arriba termina
  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center">
        <p className="text-white text-xl">Cargando...</p>
      </div>
    );
  }

  // Pasa el estado real a la aplicación
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};