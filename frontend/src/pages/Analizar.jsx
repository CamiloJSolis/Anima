import React, { useEffect, useState } from 'react';
import { Camera, UploadCloud, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Analizar.css';

const Analyze = ({ user: userProp = null }) => {
  const [user, setUser] = useState(userProp);

  useEffect(() => {
    // Si no viene por props, lo consultamos al backend
    if (!userProp) {
      api.get('/auth/me')
        .then(res => setUser(res.data?.user || null))
        .catch(() => setUser(null));
    }
  }, [userProp]);

  const isLoggedIn = !!user;
  const displayName =
    (user?.username && user.username.trim()) ||
    (user?.name && user.name.trim()) ||
    (user?.email ? user.email.split('@')[0] : 'invitado');

  const avatarSrc = user?.avatar || '/default-avatar.png';

  return (
    <div className="analyze-layout">
      <header className="analyze-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="welcome-title">¡Hola, {displayName}!</h1>
            <p className="welcome-text">Bienvenido a Ánima</p>
          </div>

          <div className="user-section">
            {isLoggedIn ? (
              <>
                <img
                  src={'./default-avatar.png'}
                  alt={displayName}
                  className="user-avatar"
                />
                <span className="user-name">@{displayName}</span>
              </>
            ) : (
              <Link to="/login" className="guest-login">
                <LogIn size={20} className="login-icon" />
                <span className="login-text">Iniciar sesión</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="analyze-main">
        <div className="analyze-box">
          <UploadCloud className="cloud-icon" />
          <h2 className="analyze-title">Analizar emoción</h2>
          <p className="analyze-description">
            Sube una foto o usa la cámara para detectar tu emoción
          </p>
          <button className="analyze-button">
            <Camera size={20} />
            <span>Capturar Foto</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Analyze;