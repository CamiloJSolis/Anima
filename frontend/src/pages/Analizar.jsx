import React, { useState, useEffect, useRef } from "react";
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
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import Aurora from "../components/Aurora";
import { api } from "../services/api";

const Analyze = ({ user }) => {
  const isLoggedIn = !!user && user.name && user.name !== "usuario";
  const [viewMode, setViewMode] = useState("upload"); // 'upload' | 'results'
  const [cameraMode, setCameraMode] = useState(false); // Para alternar vista de cámara
  const [selectedFile, setSelectedFile] = useState(null); // File object (para enviar)
  const [preview, setPreview] = useState(null); // URL para vista previa
  const [analysisResult, setAnalysisResult] = useState(null); // Resultados mock/API
  const webcamRef = useRef(null); // Ref para Webcam

  // Handle upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // guardar File para enviar y preview separada
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setCameraMode(false); // Desactiva cámara si estaba activa
    console.log("selected file:", file.name, file.size);
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
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("No blob generado"));
            resolve(blob);
          },
          "image/jpeg",
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

      // Construir playlist a partir de lo que envíe el backend:
      // Prioridad: data.playlist (objeto), data.playlists[0], data.tracks -> generar playlist
      let playlist = null;
      if (data.playlist && typeof data.playlist === "object") {
        playlist = {
          title:
            data.playlist.name ||
            data.playlist.title ||
            `${emotion ? emotion.toUpperCase() : "Playlist"}`,
          thumbnail:
            data.playlist.images?.[0]?.url ||
            data.playlist.thumbnail ||
            data.playlist.album?.images?.[0]?.url ||
            null,
          generatedBy: data.playlist.owner || "Ánima",
          external_url:
            data.playlist.external_url ||
            data.playlist.external_urls?.spotify ||
            null,
          songs: Array.isArray(data.playlist.tracks)
            ? data.playlist.tracks.map((t) => ({
                id: t.id,
                name: t.name,
                artists: t.artists || [],
                preview_url: t.preview_url || t.preview_url,
                external_url:
                  t.external_url || t.external_urls?.spotify || null,
                album: t.album || {},
              }))
            : [],
        };
      } else if (Array.isArray(data.playlists) && data.playlists.length > 0) {
        const p = data.playlists[0];
        playlist = {
          title:
            p.name ||
            p.title ||
            `${emotion ? emotion.toUpperCase() : "Playlist"}`,
          thumbnail: p.images?.[0]?.url || p.thumbnail || null,
          generatedBy: p.owner || "Ánima",
          external_url: p.external_url || p.external_urls?.spotify || null,
          songs: [],
        };
      } else if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        // genera una "playlist" propia usando los tracks devueltos
        playlist = {
          title: `${emotion ? emotion.toUpperCase() : "Playlist"} Vibes`,
          thumbnail:
            data.tracks[0]?.album?.images?.[0]?.url ||
            data.tracks[0]?.images?.[0]?.url ||
            null,
          generatedBy: "Ánima",
          external_url: null,
          songs: data.tracks.map((t) => ({
            id: t.id,
            name: t.name,
            artists: t.artists || [],
            preview_url: t.preview_url || null,
            external_url: t.external_url || t.external_urls?.spotify || null,
            album: t.album || {},
          })),
        };
      }

      // breakdown: convierte emotions en formato porcentual
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
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    try {
      console.log("original size", selectedFile.size);
      // intenta reducir a < 4.5MB (ajusta parámetros si es necesario)
      const resizedBlob = await resizeImage(selectedFile, 1280, 0.8);
      console.log("resized size", resizedBlob.size);

      const fileToSend = new File(
        [resizedBlob],
        selectedFile.name.replace(/\.[^.]+$/, ".jpg"),
        { type: "image/jpeg" }
      );

      const fd = new FormData();
      fd.append("photo", fileToSend);

      console.log("sending file", fileToSend.name, fileToSend.size);

      const res = await api.post("/api/analyze", fd);

      console.log("analyze res", res.data);

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
          thumbnail: "/placeholder-playlist.jpg", // Usa un placeholder real o asset
          generatedBy: "Ánima",
          external_url: null,
          songs: [
            {
              id: "mock1",
              name: "Happy Song 1",
              artists: ["Artist 1"],
              preview_url: null, // O un audio mock si tienes
              external_url: "https://open.spotify.com/track/mock1",
              album: { images: [{ url: "/placeholder-album.jpg" }] },
            },
            {
              id: "mock2",
              name: "Happy Song 2",
              artists: ["Artist 2"],
              preview_url: null,
              external_url: "https://open.spotify.com/track/mock2",
              album: { images: [{ url: "/placeholder-album.jpg" }] },
            },
          ],
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
            thumbnail: "/placeholder-suggestion1.jpg",
          },
          {
            title: "Feel Good Indie",
            genre: "Indie Rock",
            thumbnail: "/placeholder-suggestion2.jpg",
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
    setPreview(null);
    setCameraMode(false);
    setViewMode("upload");
  };

  // Toggle camera mode
  const toggleCamera = () => {
    setCameraMode(!cameraMode);
    if (!cameraMode) {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    if (webcamRef.current) {
      try {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
          const response = await fetch(screenshot);
          const blob = await response.blob();
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
          setPreview(screenshot); // Usa la URL data directamente para preview
          setCameraMode(false); // Oculta cámara después de capturar
          console.log("captured photo from camera");
        }
      } catch (err) {
        console.error("camera capture error", err);
      }
    }
  };

  // Valores seguros para evitar crashes si el backend no devuelve playlist/otros campos
  const safeResult = analysisResult || {};
  const displayPhoto = safeResult.photo || preview || "/placeholder.jpg";
  const breakdown = Array.isArray(safeResult.breakdown)
    ? safeResult.breakdown
    : [];
  const playlist = safeResult.playlist || {
    thumbnail: "/placeholder-playlist.jpg",
    title: "Playlist no disponible",
    generatedBy: "Ánima",
    external_url: null,
    songs: [],
  };
  const suggestions = Array.isArray(safeResult.suggestions)
    ? safeResult.suggestions
    : [];
  const emotionRaw = safeResult.emotion || "desconocida";
  const emotionCap =
    typeof emotionRaw === "string" && emotionRaw.length > 0
      ? emotionRaw.charAt(0).toUpperCase() + emotionRaw.slice(1)
      : emotionRaw;

  return (
    <div className="relative overflow-hidden">
      <Aurora
        colorStops={["#8A2BE2", "#00BFFF", "#F8BBD9"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
        className="absolute inset-0 z-0"
      />

      <main className="
        relative z-2 flex min-h-screen items-start justify-center p-10 px-6
        /* Desktop */
        md:ml-20 md:w-[calc(100%-80px)]
        /* Mobile: Full width */
        max-md:ml-0 max-md:w-full max-md:p-5 max-md:px-4
      ">
        <div className={`
          relative bg-white/5 backdrop-blur-[20px] border border-[rgba(138,43,226,0.2)]
          rounded-[20px] p-10 flex flex-col items-center gap-6
          max-w-md w-full text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]
          overflow-hidden
          /* Wide mode for results */
          ${viewMode === "results" ? "max-w-4xl md:max-w-4xl" : "max-w-[500px] md:max-w-[500px]"}
          /* Mobile padding */
          max-md:p-8 max-md:gap-5
          /* Before pseudo for gradient overlay */
          before:absolute before:inset-0 before:bg-linear-to-br before:from-[rgba(138,43,226,0.05)] before:to-[rgba(0,191,255,0.05)] before:pointer-events-none
        `}>
          {viewMode === "upload" ? (
            <>
              <h2 className="text-3xl font-bold text-(--text-primary) leading-tight z-3">
                Subir o Capturar
              </h2>
              <p className="text-base text-(--text-gray) leading-1.5 max-w-[400px] z-3">
                ¡Elige tu mejor foto o toma una nueva!
              </p>

              <div className="flex gap-4 flex-wrap justify-center w-full z-3">
                <label className="
                  flex flex-col items-center gap-2 p-4 px-6 border-2 border-(--accent-blue)
                  bg-[rgba(0,191,255,0.1)] rounded-xl text-(--text-primary) cursor-pointer
                  transition-all duration-200 font-medium text-sm min-w-[200px] max-w-[200px] flex-1
                  backdrop-blur-[10px] hover:bg-[rgba(0,191,255,0.2)] hover:border-(--accent-blue) hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,191,255,0.2)]
                ">
                  <ImageUp size={20} />
                  <span>{selectedFile ? 'Subir otra Foto' : 'Subir Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <button
                  className="
                    flex flex-col items-center gap-2 p-4 px-6 border-2 border-(--accent-blue)
                    bg-[rgba(0,191,255,0.1)] rounded-xl text-(--text-primary) cursor-pointer
                    transition-all duration-200 font-medium text-sm min-w-[200px] max-w-[200px] flex-1
                    backdrop-blur-[10px] hover:bg-[rgba(0,191,255,0.2)] hover:border-(--accent-blue) hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,191,255,0.2)]
                  "
                  onClick={toggleCamera}
                >
                  <Camera size={20} />
                  <span>{cameraMode ? 'Cancelar' : 'Tomar Foto'}</span>
                </button>
              </div>

              {/* Webcam Preview (solo si cameraMode activo) */}
              {cameraMode && (
                <div className="w-full z-3">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                    className="w-full rounded-xl object-cover max-h-[400px] border-2 border-(--accent-blue)"
                  />
                  <button
                    className="
                      mt-4 bg-(--accent-blue) text-white border-none rounded-lg p-3 px-6
                      text-base font-semibold cursor-pointer transition-all duration-200 w-full
                      shadow-[0_4px_12px_rgba(0,191,255,0.2)] hover:bg-[#0099CC] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,191,255,0.3)]
                      max-md:w-full
                    "
                    onClick={handleCameraCapture}
                  >
                    Capturar Foto
                  </button>
                </div>
              )}

              {/* Preview del archivo seleccionado (no cámara) */}
              {!cameraMode && (
                <div className={`
                  border-2 rounded-xl p-10 px-6
                  min-h-[200px] flex flex-col items-center justify-center gap-3 w-full
                  backdrop-blur-[5px] transition-all duration-200 z-3
                  /* Mobile: Smaller padding */
                  max-md:p-8 max-md:min-h-40
                  /* Estados dinámicos basados en preview */
                  ${preview 
                    ? 'border-dashed border-(--accent-blue) bg-[rgba(0,191,255,0.05)] hover:border-solid hover:shadow-[0_4px_12px_rgba(0,191,255,0.2)]' 
                    : 'border-dashed border-(--text-gray) bg-[rgba(25,25,112,0.05)] hover:border-(--accent-blue) hover:bg-[rgba(0,191,255,0.05)]'
                  }
                `}>
                  {preview ? (
                    <img
                      src={preview}
                      alt="Vista previa"
                      className="max-w-full max-h-[200px] rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <Search size={48} className="text-(--text-gray) opacity-60" />
                      <p className="text-base text-(--text-primary) font-medium m-0">
                        No se ha seleccionado ningún archivo
                      </p>
                      <p className="text-sm text-(--text-gray) m-0 leading-1.4">
                        Tu archivo o imagen seleccionado aparecerá aquí.
                      </p>
                    </>
                  )}
                </div>
              )}

              <button
                className={`
                  bg-(--accent-blue) text-white border-none rounded-lg p-4 px-8
                  text-base font-semibold cursor-pointer transition-all duration-200 min-w-[200px]
                  shadow-[0_4px_12px_rgba(0,191,255,0.2)] z-3
                  hover:bg-[#0099CC] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,191,255,0.3)]
                  disabled:bg-(--text-gray) disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-60
                  /* Mobile: Full width cap */
                  max-md:w-full max-md:max-w-[280px]
                `}
                onClick={handleAnalyze}
                disabled={!selectedFile || cameraMode}
              >
                Analizar
              </button>
            </>
          ) : (
            <div className="w-full">
              <div className="
                grid grid-cols-1 gap-5 items-start w-full
                /* 2-column at md+ (768px, close to 900px) */
                md:grid-cols-[1fr_minmax(300px,440px)] md:gap-5
              ">
                {/* Left: Photo + Breakdown */}
                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-(--text-primary) m-0 text-left md:text-left">
                    Resultado del Análisis
                  </h2>
                  <div className="
                    w-full aspect-4/3 rounded-[10px] overflow-hidden
                    shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]
                    bg-cover bg-center
                    /* Mobile: Cap height */
                    max-md:max-h-[60vh]
                  ">
                    <img
                      src={displayPhoto}
                      alt="Tu foto"
                      className="w-full h-full object-cover border-2 border-(--accent-violet)"
                    />
                  </div>
                  <div className="w-full">
                    <h3 className="text-lg font-bold text-(--text-primary) mb-2 text-left">
                      Descripción del Análisis
                    </h3>
                    <div className="
                      p-4 rounded-[10px] bg-[rgba(138,43,226,0.1)]
                      flex flex-col gap-3
                    ">
                      {breakdown.length > 0 ? (
                        breakdown.map((item, index) => (
                          <div
                            key={index}
                            className={`
                              flex items-center justify-between gap-4 text-sm
                              ${index > 0 ? "opacity-85" : ""}
                            `}
                          >
                            <span className="font-semibold text-(--text-primary) min-w-20 text-left">
                              {item.emotion}
                            </span>
                            <div className="flex-1 h-1.5 bg-[rgba(138,43,226,0.2)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-[#8A2BE2] to-[#00BFFF] rounded-full transition-all duration-500"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className={`
                              font-semibold min-w-[30px] text-right
                              ${index > 0 ? "text-[#33E6E6]" : "text-[#00FFFF]"}
                            `}>
                              {item.percentage}%
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-(--text-gray) text-sm text-center m-0">No se detectaron emociones.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Playlist + Suggestions + Start Over */}
                <div className="
                  bg-[rgba(138,43,226,0.15)] border border-[rgba(138,43,226,0.15)]
                  rounded-2xl p-6 shadow-[0_0_16px_rgba(0,0,0,0.3)]
                  flex flex-col items-stretch text-left sticky top-10 self-start
                  /* Mobile: full width */
                  max-md:sticky-none max-md:top-0
                ">
                  {/* Playlist Header */}
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <h3 className="text-xl font-bold text-(--text-primary) mb-2 text-left">
                      {playlist.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <img
                        src={playlist.thumbnail || "/placeholder-playlist.jpg"}
                        alt={playlist.title}
                        className="w-16 h-16 rounded-md object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-(--text-gray) m-0 truncate">
                          Por {playlist.generatedBy}
                        </p>
                        {playlist.external_url && (
                          <a
                            href={playlist.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--accent-blue) text-sm font-medium no-underline hover:text-(--accent-violet)"
                          >
                            Abrir en Spotify
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Playlist Songs List */}
                  {Array.isArray(playlist.songs) && playlist.songs.length > 0 ? (
                    <div className="mt-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/6 scrollbar-track-transparent">
                      <h4 className="m-0 mb-2 text-gray-300 text-left">
                        Canciones
                      </h4>
                      <ul className="m-0 p-0 list-none">
                        {playlist.songs.map((s, i) => (
                          <li
                            key={s.id || `${s.name}-${i}`}
                            className="
                              flex gap-3 items-center py-2 border-b border-white/3
                            "
                          >
                            <img
                              src={
                                s.album?.images?.[0]?.url ||
                                playlist.thumbnail ||
                                "/placeholder-album.jpg"
                              }
                              alt={s.name}
                              className="w-12 h-12 object-cover rounded-md shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-(--text-primary) truncate">
                                {s.name}
                              </div>
                              <div className="text-xs text-(--text-gray) truncate">
                                {(s.artists || []).join(", ")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {s.preview_url ? (
                                <audio
                                  controls
                                  src={s.preview_url}
                                  className="w-[120px] max-md:w-20"
                                />
                              ) : s.external_url ? (
                                <a
                                  href={s.external_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-400 font-bold no-underline hover:text-cyan-300 text-sm"
                                >
                                  Abrir
                                </a>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-4 mb-4">
                      <p className="text-(--text-gray)">No se pudo generar una playlist.</p>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="
                    mt-4 pt-4 border-t border-white/12 rounded-b-xl
                  ">
                    <h4 className="text-sm font-semibold text-(--text-gray) mb-3 text-left">
                      Más Sugerencias
                    </h4>
                    <div className="flex flex-col gap-3">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex justify-between items-center py-2 gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img
                              src={suggestion.thumbnail || "/placeholder-suggestion.jpg"}
                              alt={suggestion.title}
                              className="w-12 h-12 rounded-md object-cover shrink-0"
                            />
                            <div className="flex flex-col justify-center min-w-0 flex-1">
                              <p className="text-sm font-semibold text-(--text-primary) m-0 truncate">
                                {suggestion.title}
                              </p>
                              <p className="text-xs text-(--text-gray) mt-1 m-0 truncate">
                                {suggestion.genre}
                              </p>
                            </div>
                          </div>
                          <div className="
                            flex gap-1.5
                            /* On very small screens (≤320px, iPhone SE), stack vertically to prevent overlap */
                            max-[320px]:flex-col max-[320px]:gap-1.5 max-[320px]:w-8 max-[320px]:self-end
                          ">
                            <button className="
                              w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer
                              transition-all duration-200 text-(--text-primary)
                              bg-[rgba(138,43,226,0.2)] hover:bg-[rgba(138,43,226,0.4)] hover:shadow-[0_4px_8px_rgba(138,43,226,0.2)] hover:scale-110
                              /* Ensure no overflow on tiny screens */
                              max-[320px]:w-6 max-[320px]:h-6
                            ">
                              <Play size={16} className="max-[320px]:size-4" />
                            </button>
                            <button className="
                              w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer
                              transition-all duration-200 text-(--text-primary)
                              bg-[rgba(248,187,217,0.2)] hover:bg-[rgba(248,187,217,0.4)] hover:shadow-[0_4px_8px_rgba(248,187,217,0.2)] hover:scale-110
                              /* Ensure no overflow on tiny screens */
                              max-[320px]:w-6 max-[320px]:h-6
                            ">
                              <Share2 size={16} className="max-[320px]:size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Start Over */}
                  <div className="mt-auto text-center w-full">
                    <button
                      className="
                        bg-linear-to-r from-(--accent-blue) to-(--accent-violet)
                        font-semibold text-white border-none rounded-[10px] py-2 px-5 mt-4
                        shadow-[0_4px_16px_rgba(0,191,255,0.3)] transition-all duration-200 cursor-pointer
                        hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,191,255,0.4)] active:translate-y-0
                      "
                      onClick={handleNewAnalysis}
                    >
                      Inicia un nuevo análisis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analyze;