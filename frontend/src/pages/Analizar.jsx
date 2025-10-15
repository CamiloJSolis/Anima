// export default Analyze;
import React from 'react';
import { UploadCloud, Camera } from 'lucide-react';
import '../styles/Analizar.css';

const Analyze = () => {
  return (
    <div className="analyze-layout">
      {/* Header de Bienvenida (barra superior como en la foto) */}
      <header className="analyze-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="welcome-title">¡Hola, usuario!</h1>
            <p className="welcome-text">Bienvenido a Ánima </p>  {/* ★ como en la imagen */}
          </div>
        </div>
      </header>

      {/* Área Central: Box de Análisis */}
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