import React from 'react';
import { Routes, Route } from 'react-router-dom'; 

import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Analizar from './pages/Analizar.jsx';
import Historial from './pages/Historial.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Profile from './pages/Profile.jsx';
// Seguimos importando el guardia, porque SÍ lo usaremos para /profile
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="main-content flex-1 overflow-auto">
        <Routes>
          {/* --- Rutas Públicas (Cualquiera puede verlas) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/analizar" element={<Analizar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* --- ¡ARREGLO AQUÍ! --- */}
          {/* '/historial' ahora es PÚBLICA. */}
          {/* El componente 'Historial.jsx' decidirá por sí mismo qué mostrar. */}
          <Route path="/historial" element={<Historial />} /> 
          
          {/* --- Ruta Protegida (¡El perfil SÍ debe ser secreto!) --- */}
          {/* Dejamos el guardia aquí porque /profile SÍ es 100% privado */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;