import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// 1. Importa el Router y el AuthProvider
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './services/auth.jsx'; // Asegúrate que la ruta sea correcta

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envuelve TODO con BrowserRouter */}
    <BrowserRouter>
      {/* 3. Envuelve App con AuthProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);