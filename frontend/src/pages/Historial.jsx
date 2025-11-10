import React, { useState, useEffect } from 'react';
import { Play, Edit3, MoreVertical, LogIn } from 'lucide-react';
import SongTicker from '../components/SongTicker.jsx';
import { Link } from 'react-router-dom';
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
      if (!user) {
        if (mounted) setLoading(false); // Early exit for non-logged: stop loading
        return;
      }
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
  }, [user]); // Depend on user now

  const displayName =
    (user?.username && user.username.trim()) ||
    (user?.name && user.name.trim()) ||
    (user?.email ? user.email.split('@')[0] : 'usuario');

  if (loading) return <div className="text-center py-10 text-(--text-gray)">Cargando...</div>;

  const isLoggedIn = !!user; // Simple check

  return (
    <div className="
      min-h-screen bg-(--bg-primary) text-(--text-primary) font-(--font-family)
      flex flex-col relative
      /* Desktop: Sidebar offset */
      ml-20 w-[calc(100%-80px)]
      /* Mobile: Full width */
      max-md:ml-0 max-md:w-full max-md:pt-20 max-md:pb-24
    ">
      {/* Header */}
      <header className="
        bg-[rgba(0,0,17,0.8)] backdrop-blur-[10px] border-b border-[rgba(138,43,226,0.3)]
        sticky top-0 z-20 p-3 px-6 flex items-center justify-start
        /* Sticky only in desktop */
        md:sticky md:top-0 md:z--20
      ">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white m-0">
            ¡Hola, {displayName}!
          </h1>
          {isLoggedIn ? (
            dominant?.dominant_emotion ? (
              <p className="text-sm text-(--text-gray) m-0">
                🎧 Emoción dominante esta semana: <strong>{dominant.dominant_emotion}</strong> ({dominant.count} detecciones)
              </p>
            ) : (
              <p className="text-sm text-(--text-gray) m-0">
                Aún no hay suficientes datos para el resumen semanal.
              </p>
            )
          ) : (
            <p className="text-sm text-(--text-gray) m-0">
              Inicia sesión para ver tu historial personalizado.
            </p>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="
        flex-1 min-w-0 p-10 px-6 overflow-y-auto
        /* Mobile: Adjusted padding */
        max-md:p-6 max-md:px-4
      ">
        <div className="w-full max-w-[1200px] mx-auto">
          {isLoggedIn ? (
            <>
              <h2 className="
                text-2xl font-semibold text-(--text-primary) mb-6 pl-2
                border-l-4 border-(--accent-violet)
                /* Mobile: Smaller */
                max-md:text-xl max-md:mb-4
              ">
                Recomendaciones recientes
              </h2>

              {history.length === 0 ? (
                <p className="text-(--text-gray) text-center py-10">
                  No hay historial aún. ¡Ve a Analizar y genera recomendaciones!
                </p>
              ) : (
                <div className="
                  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                  gap-5 w-full
                  /* Mobile: Tighter */
                  max-md:gap-4
                ">
                  {history.map((session) => (
                    <div
                      key={session.id}
                      className="
                        bg-(--bg-secondary) rounded-xl overflow-hidden
                        shadow-[0_4px_16px_rgba(0,0,0,0.3)]
                        transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(138,43,226,0.2)]
                      "
                    >
                      <div className="relative w-full h-[200px] overflow-hidden max-md:h-40">
                        <img
                          src="/placeholder.jpg"
                          alt="Recomendación"
                          className="w-full h-full object-cover"
                        />
                        <button
                          className="
                            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            bg-[rgba(138,43,226,0.8)] rounded-full w-12 h-12
                            flex items-center justify-center opacity-0 transition-opacity duration-200
                            border-none cursor-pointer hover:opacity-100
                          "
                          title="Abrir primera canción en Spotify"
                          onClick={() => {
                            const first = Array.isArray(session.tracks) && session.tracks[0];
                            if (first) window.open(`https://open.spotify.com/track/${first}`, '_blank');
                          }}
                        >
                          <Play size={24} className="text-white" />
                        </button>
                      </div>

                      <div className="p-4">
                        <h3 className="text-base font-semibold text-(--text-primary) m-0 mb-1 leading-tight">
                          Emoción: {session.emotion}
                        </h3>
                        <p className="text-sm text-(--text-gray) m-0 mb-3">
                          {session.confidence
                            ? `Confianza: ${(Number(session.confidence) * 100).toFixed(1)}%`
                            : 'Confianza: N/A'}
                        </p>

                        <p className="text-xs text-(--text-gray) m-0 mb-3">
                          {session.created_at
                            ? new Date(session.created_at).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
                            : ''}
                        </p>

                        {/* Chips */}
                        <div className="flex gap-2 mb-3">
                          <span className="px-2 py-1 text-xs text-(--text-primary) bg-[rgba(138,43,226,0.1)] rounded-full">
                            {Array.isArray(session.tracks) ? session.tracks.length : 0} canciones
                          </span>
                          <span className="px-2 py-1 text-xs text-(--text-primary) bg-[rgba(138,43,226,0.1)] rounded-full">
                            {Array.isArray(session.playlists) ? session.playlists.length : 0} playlists
                          </span>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            className="
                              bg-transparent border-none text-(--text-gray) p-1 rounded
                              cursor-pointer transition-colors duration-200 flex items-center justify-center
                              hover:text-(--accent-violet) hover:bg-[rgba(138,43,226,0.1)]
                            "
                            title="Ver detalles (próximamente)"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="
                              bg-transparent border-none text-(--text-gray) p-1 rounded
                              cursor-pointer transition-colors duration-200 flex items-center justify-center
                              hover:text-(--accent-violet) hover:bg-[rgba(138,43,226,0.1)]
                            "
                            title="Más opciones (próximamente)"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Block for non-logged users
            <div className="text-center py-16 space-y-4 align-middle items-center">
              <LogIn size={64} className="mx-auto text-(--accent-violet)" />
              <h3 className="text-4xl font-semibold text-white mb-2">
                Inicia sesión para ver tu historial
              </h3>
              <p className="text-(--text-gray) mb-6 max-w-md mx-auto">
                Accede a tus análisis anteriores, emociones dominantes y recomendaciones personalizadas.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/login"
                  className="
                    inline-block bg-linear-to-r from-(--accent-violet) to-(--accent-blue)
                    text-white px-6 py-3 rounded-[10px] font-semibold
                    shadow-[0_4px_12px_rgba(138,43,226,0.3)]
                    hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(138,43,226,0.4)]
                    transition-all duration-200
                  "
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/login?mode=register"
                  className="
                    inline-block bg-linear-to-r from-(--accent-violet)/95 to-(--accent-blue)/25
                    text-white px-6 py-3 rounded-[10px] font-semibold
                    shadow-[0_4px_12px_rgba(138,43,226,0.3)]
                    hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(138,43,226,0.4)]
                    transition-all duration-200
                  "
                >
                  Crear Cuenta
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SongTicker at bottom */}
      <SongTicker className="
        fixed bottom-0 left-20 right-0 z-200
        bg-black/80 backdrop-blur-md p-2.5 overflow-x-auto
        border-t border-white/10
        /* Mobile: Full width */
        max-md:left-0
      " />
    </div>
  );
}