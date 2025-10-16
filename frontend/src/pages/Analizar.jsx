import React, { useState } from 'react';
import { Camera, ImageUp, Search, LogIn, Play, Share2, BarChart3, RefreshCw } from 'lucide-react';  // Íconos adicionales
import { Link } from 'react-router-dom';
import '../styles/Analizar.css';
import Aurora from '../components/Aurora';

const Analyze = ({ user }) => {
  const isLoggedIn = !!user && user.name && user.name !== 'usuario';
  const displayName = isLoggedIn ? user.name : 'invitado';
  const avatarSrc = isLoggedIn && user.avatar ? user.avatar : null;
  const [viewMode, setViewMode] = useState('upload');  // 'upload' | 'results'
  const [selectedFile, setSelectedFile] = useState(null);  // Preview de foto
  const [analysisResult, setAnalysisResult] = useState(null);  // Resultados mock/API

  // Handle upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
    }
  };

  // Handle analyze
  const handleAnalyze = () => {
    if (selectedFile) {
      // Mock results 
      const mockResult = {
        emotion: 'happiness',
        confidence: 0.85,
        photo: selectedFile,  // Usa la foto subida
        playlist: {
          title: 'Happy Vibes',
          thumbnail: '/happy-vibes.jpg',  // Placeholder o de Spotify
          generatedBy: 'Ánima',
          songs: ['Song 1 - Artist 1', 'Song 2 - Artist 2']
        },
        breakdown: [
          { emotion: 'Happiness', percentage: 85 },
          { emotion: 'Surprise', percentage: 9 },
          { emotion: 'Calm', percentage: 6 }
        ]
      };
      setAnalysisResult(mockResult);
      setViewMode('results');
    }
  };

  // Start over
  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setViewMode('upload');
  };

  // Handle camera 
  const handleCameraCapture = () => {
    // Implementa cámara aquí
    console.log('Tomar foto con cámara');
  };

  return (
    <div className="analyze-layout">
      <Aurora 
        colorStops={["#8A2BE2", "#00BFFF", "#F8BBD9"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />

      <main className="analyze-main">
        <div className="analyze-container">
          {viewMode === 'upload' ? (
            <>
              <h2 className="upload-title">Subir o Capturar</h2>
              <p className="upload-subtitle">¡Elige tu mejor foto o toma una nueva!</p>
              
              <div className="button-group">
                <label className="upload-button">
                  <ImageUp size={20} />
                  <span>Subir Archivo</span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
                </label>
                <button className="capture-button" onClick={handleCameraCapture}>
                  <Camera size={20} />
                  <span>Tomar Foto</span>
                </button>
              </div>
              
              <div className="photo-preview">
                {selectedFile ? (
                  <img src={selectedFile} alt="Vista previa" className="preview-image" />
                ) : (
                  <>
                    <Search size={48} className="preview-icon" />
                    <p className="no-file-text">No se ha seleccionado ningún archivo</p>
                    <p className="preview-subtitle">Tu archivo o imagen seleccionado aparecerá aquí.</p>
                  </>
                )}
              </div>
              
              <button 
                className={`analyze-button ${!selectedFile ? 'disabled' : ''}`}
                onClick={handleAnalyze}
                disabled={!selectedFile}
              >
                Analizar
              </button>
            </>
          ) : (
            <>
              <h2 className="results-title">Resultado del Análisis</h2>
              
              <div className="results-grid">
                {/* Izquierda: Foto con Emoción */}
                <div className="results-left">
                  <img src={analysisResult.photo} alt="Tu foto" className="results-photo" />
                  <div className="emotion-overlay">
                    <span className="emotion-label">{analysisResult.emotion.toUpperCase()}</span>
                  </div>
                </div>

                {/* Derecha: Playlist */}
                <div className="results-right">
                  <h3 className="playlist-title">Tu Playlist {analysisResult.emotion} </h3>
                  <img src={analysisResult.playlist.thumbnail} alt="Playlist" className="playlist-thumbnail" />
                  <p className="playlist-generated">Generado por Ánima</p>
                  <div className="playlist-actions">
                    <button className="play-button">
                      <Play size={20} />
                      <span>Escuchar</span>
                    </button>
                    <button className="share-button">
                      <Share2 size={20} />
                      <span>Compartir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="breakdown-section">
                <h3 className="breakdown-title">Detalle del Análisis</h3>
                <div className="breakdown-bars">
                  {analysisResult.breakdown.map((item, index) => (
                    <div key={index} className="bar-item">
                      <span className="bar-label">{item.emotion}</span>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="bar-percentage">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="start-over-button" onClick={handleNewAnalysis}>
                <RefreshCw size={20} />
                <span>Inicia un nuevo análisis</span>
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analyze;