import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Analizar from './pages/Analizar.jsx';
import Historial from './pages/Historial.jsx';
import Login from './pages/Login.jsx';

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <main className="main-content flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analizar" element={<Analizar />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;