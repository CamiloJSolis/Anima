import React from 'react';
import { Camera, UploadCloud, User, LogIn } from 'lucide-react'; // Agrega User y LogIn
import { Link } from 'react-router-dom'; // Para enlace a login
import '../styles/Analizar.css';

const Analyze = ({ user }) => { // user opcional: null para guest
  const isLoggedIn = !!user && user.name && user.name !== 'usuario'; // Detecta logged in
  const displayName = isLoggedIn ? user.name : 'invitado';
  const avatarSrc = isLoggedIn && user.avatar ? user.avatar : null;

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
                  src={avatarSrc || '/default-avatar.png'}
                  alt={displayName}
                  className="user-avatar"
                />
                <span className="user-name">{displayName}</span>
              </>
            ) : (
              <Link to="/login" className="guest-login">
                <LogIn size={20} className="login-icon" />
                <span className="login-text">Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="analyze-main">
        <div className="analyze-box">
          <UploadCloud className="cloud-icon" />
          <h2 className="analyze-title">Analizar emoción</h2>
          <p className="analyze-description">Sube una foto o usa la cámara para detectar tu emoción</p>
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