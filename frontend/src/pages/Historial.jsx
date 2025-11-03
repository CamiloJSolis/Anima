import React, { useState, useEffect } from 'react';
import { Play, Edit3, MoreVertical } from 'lucide-react';
import '../styles/Historial.css';
import SongTicker from '../components/SongTicker.jsx';
import { api } from '../services/api';

export default function Historial({ user: userProp = null }) {
  const [user, setUser] = useState(userProp);
  const [history, setHistory] = useState([]);
  const [dominant, setDominant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario (si no vino por props)
  useEffect(() => {
    let mounted = true;
    if (!userProp) {
      api.get('/auth/me')
        .then(res => { if (mounted) setUser(res.data?.user || null); })
        .catch(() => { if (mounted) setUser(null); });
    }
    return () => { mounted = false; };
  }, [userProp]);

  // Cargar historial y resumen semanal (requiere estar logueado)
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [histRes, summaryRes] = await Promise.all([
          api.get('/recommendations/history?page=1&limit=20'),
          api.get('/recommendations/weekly-summary')
        ]);
        if (!mounted) return;
        setHistory(histRes.data || []);
        setDominant(summaryRes.data || null);
        setError(null);
      } catch (err) {
        console.error('Error cargando historial:', err);
        if (mounted) setError('No se pudo cargar tu historial o el resumen semanal.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  const displayName =
    (user?.username && user.username.trim()) ||
    (user?.name && user.name.trim()) ||
    (user?.email ? user.email.split('@')[0] : 'usuario');

  if (loading) return <div className="historial-loading">Cargando...</div>;
  if (error) return (
    <div className="historial-layout">
      <header className="historial-header">
        <div className="header-content">
          <h1 className="welcome-title">¡Hola, {displayName}!</h1>
          <p className="welcome-text">{error}</p>
        </div>
      </header>
    </div>
  );

  return (
    <div className="historial-layout">
      {/* Header */}
      <header className="historial-header">
        <div className="header-content">
          <h1 className="welcome-title">¡Hola, {displayName}!</h1>
          {dominant?.dominant_emotion ? (
            <p className="welcome-text">
              🎧 Emoción dominante esta semana: <strong>{dominant.dominant_emotion}</strong> ({dominant.count} detecciones)
            </p>
          ) : (
            <p className="welcome-text">Aún no hay suficientes datos para el resumen semanal.</p>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="historial-main">
        <div className="historial-section">
          <h2 className="section-title">Recomendaciones recientes</h2>

          {history.length === 0 ? (
            <p className="no-history">No hay historial aún. ¡Ve a Analizar y genera recomendaciones!</p>
          ) : (
            <div className="sessions-grid">
              {history.map((session) => (
                <div key={session.id} className="playlist-card">
                  <div className="card-thumbnail">
                    <img
                      src="/placeholder.jpg"
                      alt="Recomendación"
                      className="thumbnail-img"
                    />
                    <button className="play-overlay" title="Abrir primera canción en Spotify"
                      onClick={() => {
                        const first = Array.isArray(session.tracks) && session.tracks[0];
                        if (first) window.open(`https://open.spotify.com/track/${first}`, '_blank');
                      }}
                    >
                      <Play size={24} className="play-icon" />
                    </button>
                  </div>

                  <div className="card-content">
                    <h3 className="card-title">Emoción: {session.emotion}</h3>
                    <p className="card-artist">
                      {session.confidence
                        ? `Confianza: ${(Number(session.confidence) * 100).toFixed(1)}%`
                        : 'Confianza: N/A'}
                    </p>

                    <p className="card-artist small">
                      {session.created_at
                        ? new Date(session.created_at).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
                        : ''}
                    </p>

                    {/* Chips rápidos con conteo de elementos */}
                    <div className="chips">
                      <span className="chip">{Array.isArray(session.tracks) ? session.tracks.length : 0} canciones</span>
                      <span className="chip">{Array.isArray(session.playlists) ? session.playlists.length : 0} playlists</span>
                    </div>

                    <div className="card-actions">
                      <button className="action-btn edit" title="Ver detalles (próximamente)">
                        <Edit3 size={16} />
                      </button>
                      <button className="action-btn more" title="Más opciones (próximamente)">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
