import React, { useState, useEffect } from "react";
import {
  Camera,
  ImageUp,
  Search,
  LogIn,
  Play,
  Share2,
  BarChart3,
  RefreshCw,
} from "lucide-react"; // Íconos adicionales
import { Link } from "react-router-dom";
import "../styles/Analizar.css";
import Aurora from "../components/Aurora";
import { api } from "../services/api";

const Analyze = ({ user }) => {
  const isLoggedIn = !!user && user.name && user.name !== "usuario";
  const [viewMode, setViewMode] = useState("upload"); // 'upload' | 'results'
  const [selectedFile, setSelectedFile] = useState(null); // File object (para enviar)
  const [preview, setPreview] = useState(null); // URL para vista previa
  const [analysisResult, setAnalysisResult] = useState(null); // Resultados mock/API

  // Handle upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // guardar File para enviar y preview separada
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    console.log('selected file:', file.name, file.size);
  };

  // liberar URL creada al cambiar o desmontar
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

   // Redimensiona/comprime la imagen en el cliente antes de enviar
  async function resizeImage(file, maxWidth = 1280, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('No blob generado'));
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (e) => reject(e);
      img.src = URL.createObjectURL(file);
    });
  }

  /* Normaliza la respuesta del backend (Rekognition + lógica de generación de playlist)
   a la forma que espera la UI */
  function normalizeAnalysisResponse(data = {}, preview) {
    // Si el backend devuelve dominantEmotion/emotions/faceDetails (servicio Rekognition)
    if (data.dominantEmotion || Array.isArray(data.emotions)) {
      const dominant =
        data.dominantEmotion || (data.emotions && data.emotions[0]) || null;
      const emotionRaw = dominant?.Type || dominant?.Type || null;
      const emotion = emotionRaw ? emotionRaw.toLowerCase() : null;
      const confidence = dominant?.Confidence ?? null;

      // Si tu backend también devuelve playlist generado por integra con Spotify:
      const playlist = data.playlist || null;

      // breakdown: convierte emotions en formato porcentual (opcional)
      const breakdown = (data.emotions || []).map((e) => ({
        emotion: e.Type,
        percentage:
          typeof e.Confidence === "number" ? Math.round(e.Confidence) : null,
      }));

      return {
        emotion,
        confidence,
        photo: data.photo || preview,
        playlist,
        breakdown,
        suggestions: data.suggestions || [],
      };
    }

    // Si el backend ya devuelve el formato de la UI (o usamos mock)
    return {
      emotion: data.emotion || null,
      confidence: data.confidence ?? null,
      photo: data.photo || preview,
      playlist: data.playlist || null,
      breakdown: data.breakdown || [],
      suggestions: data.suggestions || [],
    };
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    try {
      console.log('original size', selectedFile.size);
      // intenta reducir a < 4.5MB (ajusta parámetros si es necesario)
      const resizedBlob = await resizeImage(selectedFile, 1280, 0.8);
      console.log('resized size', resizedBlob.size);

      const fileToSend = new File([resizedBlob], selectedFile.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });

      const fd = new FormData();
      fd.append('photo', fileToSend);

      console.log('sending file', fileToSend.name, fileToSend.size);

      const res = await api.post("/analyze", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('analyze res', res.data);

      const normalized = normalizeAnalysisResponse(res.data, preview);
      setAnalysisResult(normalized);
      setViewMode("results");
    } catch (err) {
      console.error("analyze error", err?.response?.data || err.message);
      // Fallback: usar mock para que la UI funcione si hay error
      const mockResult = {
        emotion: "happiness",
        confidence: 0.85,
        photo: preview,
        playlist: {
          title: "Happy Vibes",
          thumbnail: "../public/happy-vibes.jpg",
          generatedBy: "Ánima",
          songs: ["Song 1 - Artist 1", "Song 2 - Artist 2"],
        },
        breakdown: [
          { emotion: "Happiness", percentage: 85 },
          { emotion: "Surprise", percentage: 9 },
          { emotion: "Calm", percentage: 6 },
        ],
        suggestions: [
          {
            title: "Uplifting Beats",
            genre: "Electronic",
            thumbnail: "/uplifting-beats.jpg",
          },
          {
            title: "Feel Good Indie",
            genre: "Indie Rock",
            thumbnail: "/feel-good-indie.jpg",
          },
        ],
      };
      setAnalysisResult(mockResult);
      setViewMode("results");
    }
  };

  // Start over
  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setViewMode("upload");
  };

  // Handle camera
  const handleCameraCapture = () => {
    // Codigo para implementar cámara
    console.log("Tomar foto con cámara");
  };

  // Valores seguros para evitar crashes si el backend no devuelve playlist/otros campos
  const safeResult = analysisResult || {};
  const displayPhoto = safeResult.photo || preview || "/placeholder.jpg";
  const breakdown = Array.isArray(safeResult.breakdown) ? safeResult.breakdown : [];
  const playlist = safeResult.playlist || {
    thumbnail: "/placeholder.jpg",
    title: "Playlist no disponible",
    generatedBy: "Ánima",
    songs: [],
  };
  const suggestions = Array.isArray(safeResult.suggestions) ? safeResult.suggestions : [];
  const emotionRaw = safeResult.emotion || "desconocida";
  const emotionCap =
    typeof emotionRaw === "string" && emotionRaw.length > 0
      ? emotionRaw.charAt(0).toUpperCase() + emotionRaw.slice(1)
      : emotionRaw;


  return (
    <div className="analyze-layout">
      <Aurora
        colorStops={["#8A2BE2", "#00BFFF", "#F8BBD9"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />

      <main className="analyze-main">
        <div
          className={`analyze-container ${
            viewMode === "results" ? "wide" : ""
          }`}
        >
          {viewMode === "upload" ? (
            <>
              <h2 className="upload-title">Subir o Capturar</h2>
              <p className="upload-subtitle">
                ¡Elige tu mejor foto o toma una nueva!
              </p>

              <div className="button-group">
                <label className="upload-button">
                  <ImageUp size={20} />
                  <span>Subir Archivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    hidden
                  />
                </label>
                <button
                  className="capture-button"
                  onClick={handleCameraCapture}
                >
                  <Camera size={20} />
                  <span>Tomar Foto</span>
                </button>
              </div>

              <div className="photo-preview">
                {preview ? (
                  <img
                    src={preview}
                    alt="Vista previa"
                    className="preview-image"
                  />
                ) : (
                  <>
                    <Search size={48} className="preview-icon" />
                    <p className="no-file-text">
                      No se ha seleccionado ningún archivo
                    </p>
                    <p className="preview-subtitle">
                      Tu archivo o imagen seleccionado aparecerá aquí.
                    </p>
                  </>
                )}
              </div>

              <button
                className={`analyze-button ${!selectedFile ? "disabled" : ""}`}
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
                    <img
                      src={analysisResult.photo}
                      alt="Tu foto"
                      className="results-photo"
                    />
                  </div>
                  <div className="breakdown-section">
                    <h3 className="breakdown-title">
                      Descripción del Análisis
                    </h3>
                    <div className="breakdown-bars">
                      {analysisResult.breakdown.map((item, index) => (
                        <div
                          key={index}
                          className={`bar-item ${
                            index > 0 ? "secondary-bar" : ""
                          }`}
                        >
                          <span className="bar-label">{item.emotion}</span>
                          <div className="bar-container">
                            <div
                              className="bar-fill"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span
                            className={`bar-percentage ${
                              index > 0 ? "secondary-percentage" : ""
                            }`}
                          >
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Columna derecha: Playlist y Start Over */}
                <div className="results-right">
                  <h3 className="playlist-title">
                    Tu Playlist{emotionCap}
                  </h3>
                  
                  {/* Render condicional: solo mostrar card si existe playlist */}
                  {playlist ? (
                    <div className="analyze-playlist-card">
                      <div className="playlist-header">
                        <img
                          src={playlist.thumbnail}
                          alt="Playlist"
                          className="playlist-thumbnail"
                        />
                        <div className="playlist-info">
                          <p className="playlist-type">Playlist</p>
                          <p className="playlist-name">{playlist.title}</p>
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
                  ) : (
                    <div className="analyze-playlist-card-empty">
                      <p>No se pudo generar una playlist.</p>
                    </div>
                  )}

                  {/* Sección de sugerencias de playlists */}
                  <div className="suggestions-section">
                    <h4 className="suggestions-title">Más Sugerencias</h4>
                    <div className="suggestions-list">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-item">
                          <div className="suggestion-header">
                            <img
                              src={suggestion.thumbnail}
                              alt={suggestion.title}
                              className="suggestion-thumbnail"
                            />
                            <div className="suggestion-info">
                              <p className="suggestion-name">
                                {suggestion.title}
                              </p>
                              <p className="suggestion-genre">
                                {suggestion.genre}
                              </p>
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
                    <button
                      className="start-over-button"
                      onClick={handleNewAnalysis}
                    >
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
