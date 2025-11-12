import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Analizar from './pages/Analizar.jsx';
import Historial from './pages/Historial.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
// 1. Comenta esta línea
// import Profile from './pages/Profile.jsx'; 

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="main-content flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analizar" element={<Analizar />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* 2. Comenta esta línea */}
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;