import React from 'react';
import { useAuth } from '../services/auth.jsx';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Muestra "Cargando..." mientras el auth.jsx verifica si hay sesión
    return (
      <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center">
        <p className="text-white text-xl">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // ¡La magia! Si no está logueado, lo redirige a /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está logueado, deja pasar al usuario al componente (Profile o Historial)
  return children;
};

export default ProtectedRoute;