import React, { useState } from 'react';
import { Camera, ImageUp, Search, LogIn, Play, Share2, BarChart3, RefreshCw } from 'lucide-react';  // Íconos adicionales
import { Link } from 'react-router-dom';
import '../styles/Analizar.css';
import Aurora from '../components/Aurora';

const Analyze = ({ user }) => {
  const isLoggedIn = !!user && user.name && user.name !== 'usuario';
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
          thumbnail: '../public/happy-vibes.jpg',  // Placeholder o de Spotify
          generatedBy: 'Ánima',
          songs: ['Song 1 - Artist 1', 'Song 2 - Artist 2']
        },
        breakdown: [
          { emotion: 'Happiness', percentage: 85 },
          { emotion: 'Surprise', percentage: 9 },
          { emotion: 'Calm', percentage: 6 }
        ],
        suggestions: [
          { title: 'Uplifting Beats', genre: 'Electronic', thumbnail: '/uplifting-beats.jpg' },
          { title: 'Feel Good Indie', genre: 'Indie Rock', thumbnail: '/feel-good-indie.jpg' }
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
    // Codigo para implementar cámara
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
        <div className={`analyze-container ${viewMode === 'results' ? 'wide' : ''}`}>
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
              <div className="results-grid">
                {/* Columna izquierda: Foto y Breakdown */}
                <div className="results-left">
                  <h2 className="results-title">Resultado del Análisis</h2>
                  <div className="photo-section">
                    <img src={analysisResult.photo} alt="Tu foto" className="results-photo" />
                  </div>
                  <div className="breakdown-section">
                    <h3 className="breakdown-title">Descripción del Análisis</h3>
                    <div className="breakdown-bars">
                      {analysisResult.breakdown.map((item, index) => (
                        <div key={index} className={`bar-item ${index > 0 ? 'secondary-bar' : ''}`}>
                          <span className="bar-label">{item.emotion}</span>
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className={`bar-percentage ${index > 0 ? 'secondary-percentage' : ''}`}>
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Columna derecha: Playlist y Start Over */}
                <div className="results-right">
                  <h3 className="playlist-title">Tu Playlist {analysisResult.emotion.charAt(0).toUpperCase() + analysisResult.emotion.slice(1)} </h3>
                  <div className="analyze-playlist-card">
                    <div className="playlist-header">
                      <img src={analysisResult.playlist.thumbnail} alt="Playlist" className="playlist-thumbnail" />
                      <div className="playlist-info">
                        <p className="playlist-type">Playlist</p>
                        <p className="playlist-name">{analysisResult.playlist.title}</p>
                        <p className="playlist-generated">Generada por Ánima</p>
                      </div>
                    </div>
                    <div className="playlist-actions">
                      <button className="play-button">
                        <Play size={20} />
                        <span>Reproducir</span>
                      </button>
                      <button className="share-button">
                        <Share2 size={20} />
                        <span>Compartir</span>
                      </button>
                    </div>
                  </div>

                  {/* Sección de sugerencias de playlists */}
                  <div className="suggestions-section">
                    <h4 className="suggestions-title">Más Sugerencias</h4>
                    <div className="suggestions-list">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-item">
                          <div className="suggestion-header">
                            <img src={suggestion.thumbnail} alt={suggestion.title} className="suggestion-thumbnail" />
                            <div className="suggestion-info">
                              <p className="suggestion-name">{suggestion.title}</p>
                              <p className="suggestion-genre">{suggestion.genre}</p>
                            </div>
                          </div>
                          <div className="suggestion-actions">
                            <button className="suggestion-play-button">
                              <Play size={16} />
                            </button>
                            <button className="suggestion-share-button">
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="start-over-section">
                    <button className="start-over-button" onClick={handleNewAnalysis}>
                      Inicia un nuevo análisis
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analyze;