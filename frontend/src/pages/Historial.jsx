import React, { useEffect, useMemo, useState } from "react";
import { LogIn, Play, ChevronDown, Filter, SortAsc, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import SongTicker from "../components/SongTicker.jsx";
import { useAuth } from "../services/auth.jsx";
import {
  getRecommendationHistory,
  getWeeklySummary,
  getSpotifyTracksByIds,
} from "../services/api.js";

const EMO_COLORS = {
  HAPPY: "bg-green-700/20 text-green-300",
  SAD: "bg-purple-700/20 text-purple-200",
  ANGRY: "bg-red-700/20 text-red-200",
  CALM: "bg-cyan-700/20 text-cyan-200",
  FEAR: "bg-amber-700/20 text-amber-200",
  SURPRISE: "bg-pink-700/20 text-pink-200",
  CONFUSED: "bg-blue-700/20 text-blue-200",
  DISGUST: "bg-lime-700/20 text-lime-200",
};

export default function Historial() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [selectedEmotion, setSelectedEmotion] = useState("ALL");
  const [sortBy, setSortBy] = useState("date_desc"); // date_desc | date_asc | conf_desc
  const [open, setOpen] = useState(new Set()); // sesiones expandidas
  const [resolvedTracks, setResolvedTracks] = useState({}); // sessionId => [{id,name,artists,image,url}]

  // Cargar historial + resumen
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [h, s] = await Promise.all([
          // usa firma con objeto { page, limit }
          getRecommendationHistory({ page: 1, limit: 50 }),
          getWeeklySummary(),
        ]);
        if (!alive) return;
        setHistory(Array.isArray(h) ? h : []);
        setSummary(s || null);
      } catch {
        if (!alive) return;
        setHistory([]);
        setSummary(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAuthenticated, authLoading]);

  const emotions = useMemo(() => {
    const all = new Set(history.map((h) => (h.emotion || "").toUpperCase()));
    return ["ALL", ...Array.from(all)];
  }, [history]);

  const filtered = useMemo(() => {
    let arr = [...history];
    if (selectedEmotion !== "ALL") {
      arr = arr.filter((s) => (s.emotion || "").toUpperCase() === selectedEmotion);
    }
    if (sortBy === "date_desc") {
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "date_asc") {
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === "conf_desc") {
      arr.sort((a, b) => Number(b.confidence || 0) - Number(a.confidence || 0));
    }
    return arr;
  }, [history, selectedEmotion, sortBy]);

  const displayName =
    user?.username?.trim() ||
    user?.name?.trim() ||
    (user?.email ? user.email.split("@")[0] : "usuario");

  const toggleOpen = async (session) => {
    const newSet = new Set(open);
    const isOpen = newSet.has(session.id);
    if (isOpen) {
      newSet.delete(session.id);
      setOpen(newSet);
      return;
    }
    newSet.add(session.id);
    setOpen(newSet);

    // Resolver detalles de tracks sólo si no están
    if (!resolvedTracks[session.id]) {
      const ids = Array.isArray(session.tracks) ? session.tracks.slice(0, 50) : [];
      try {
        const tracks = ids.length ? await getSpotifyTracksByIds(ids) : [];
        setResolvedTracks((prev) => ({ ...prev, [session.id]: tracks }));
      } catch {
        setResolvedTracks((prev) => ({ ...prev, [session.id]: [] }));
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen ml-20 max-md:ml-0 flex items-center justify-center bg-(--bg-primary)">
        <p className="text-(--text-gray)">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="
      min-h-screen bg-(--bg-primary) text-(--text-primary) font-(--font-family)
      flex flex-col relative ml-20 w-[calc(100%-80px)]
      max-md:ml-0 max-md:w-full max-md:pt-20 max-md:pb-24
    ">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[rgba(0,0,17,0.8)] backdrop-blur-[10px] border-b border-white/10 px-6 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-white text-lg font-semibold m-0">¡Hola, {displayName}!</h1>
          {isAuthenticated ? (
            summary?.dominant_emotion ? (
              <p className="text-(--text-gray) text-sm m-0">
                🎧 Emoción dominante esta semana: <b>{summary.dominant_emotion}</b> ({summary.count} detecciones)
              </p>
            ) : (
              <p className="text-(--text-gray) text-sm m-0">
                Aún no hay suficientes datos para el resumen semanal.
              </p>
            )
          ) : (
            <p className="text-(--text-gray) text-sm m-0">
              Inicia sesión para ver tu historial personalizado.
            </p>
          )}
        </div>
      </header>

      <main className="flex-1 min-w-0 p-6">
        <div className="w-full max-w-[1200px] mx-auto">
          {!isAuthenticated ? (
            <div className="text-center py-16 space-y-4">
              <LogIn size={64} className="mx-auto text-(--accent-violet)" />
              <h3 className="text-3xl text-white font-semibold">Inicia sesión para ver tu historial</h3>
              <p className="text-(--text-gray)">Accede a tus análisis anteriores y recomendaciones.</p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-[10px] text-white bg-linear-to-r from-(--accent-violet) to-(--accent-blue)"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-6 py-3 rounded-[10px] text-white bg-linear-to-r from-(--accent-violet)/95 to-(--accent-blue)/25"
                >
                  Crear Cuenta
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-(--text-gray)" />
                  <div className="flex gap-2 flex-wrap">
                    {emotions.map((em) => (
                      <button
                        key={em}
                        onClick={() => setSelectedEmotion(em)}
                        className={[
                          "px-3 py-1 rounded-full text-sm border border-white/10",
                          em === selectedEmotion
                            ? "bg-(--accent-violet)/30 text-white"
                            : "text-(--text-gray) hover:bg-white/10",
                        ].join(" ")}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <SortAsc size={18} className="text-(--text-gray)" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm text-(--text-primary)"
                  >
                    <option value="date_desc">Más recientes</option>
                    <option value="date_asc">Más antiguas</option>
                    <option value="conf_desc">Mayor confianza</option>
                  </select>
                </div>
              </div>

              {/* Grid de sesiones */}
              {filtered.length === 0 ? (
                <p className="text-(--text-gray) text-center py-10">
                  No hay historial. Ve a{" "}
                  <Link className="underline" to="/analizar">
                    Analizar
                  </Link>{" "}
                  y genera recomendaciones.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((session) => {
                    const isOpen = open.has(session.id);
                    const chipColor =
                      EMO_COLORS[(session.emotion || "").toUpperCase()] ||
                      "bg-white/10 text-(--text-primary)";
                    const tracks = resolvedTracks[session.id];

                    return (
                      <div
                        key={session.id}
                        className="bg-(--bg-secondary) rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] overflow-hidden"
                      >
                        {/* Header tarjeta */}
                        <button
                          onClick={() => toggleOpen(session)}
                          className="w-full text-left p-4 flex items-center gap-3 hover:bg-white/5"
                        >
                          <span className={`px-2 py-0.5 rounded-full text-xs ${chipColor}`}>
                            {session.emotion || "N/A"}
                          </span>
                          <span className="text-sm text-(--text-gray)">
                            {session.confidence
                              ? `Confianza ${(Number(session.confidence) * 100).toFixed(1)}%`
                              : "Confianza N/A"}
                          </span>
                          <span className="text-xs text-(--text-gray) ml-auto">
                            {session.created_at
                              ? new Date(session.created_at).toLocaleString("es-GT", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : ""}
                          </span>
                          <ChevronDown
                            className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            size={18}
                          />
                        </button>

                        {/* Chips resumen */}
                        <div className="px-4 pb-3 flex gap-2">
                          <span className="px-2 py-1 text-xs bg-white/5 rounded-full">
                            {(session.tracks?.length || 0)} canciones
                          </span>
                          {Array.isArray(session.playlists) && session.playlists.length > 0 && (
                            <span className="px-2 py-1 text-xs bg-white/5 rounded-full">
                              {session.playlists.length} playlists
                            </span>
                          )}
                        </div>

                        {/* Contenido expandible */}
                        {isOpen && (
                          <div className="px-4 pb-4">
                            {/* Acciones rápidas */}
                            <div className="flex items-center gap-3 mb-3">
                              {Array.isArray(session.tracks) && session.tracks[0] && (
                                <a
                                  href={`https://open.spotify.com/track/${session.tracks[0]}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-(--accent-violet)/30 hover:bg-(--accent-violet)/40"
                                  title="Abrir primera canción en Spotify"
                                >
                                  <Play size={16} /> Reproducir primera
                                </a>
                              )}
                              {Array.isArray(session.playlists) && session.playlists[0]?.url && (
                                <a
                                  href={session.playlists[0].url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-white/5 hover:bg-white/10"
                                >
                                  Ver playlist <ExternalLink size={14} />
                                </a>
                              )}
                            </div>

                            {/* Pistas (lazy-resueltas) */}
                            {!tracks ? (
                              <p className="text-(--text-gray) text-sm">Cargando canciones…</p>
                            ) : tracks.length === 0 ? (
                              <p className="text-(--text-gray) text-sm">
                                No se pudieron resolver los tracks.
                              </p>
                            ) : (
                              <div className="flex gap-3 overflow-x-auto pb-2">
                                {tracks.map((t) => (
                                  <a
                                    key={t.id}
                                    href={t.url || `https://open.spotify.com/track/${t.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="min-w-[240px] max-w-[240px] bg-white/5 hover:bg-white/10 rounded-lg p-3 flex gap-3"
                                  >
                                    <img
                                      src={t.image || "/placeholder.jpg"}
                                      alt={t.name}
                                      className="w-16 h-16 rounded object-cover shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <div
                                        className="text-sm text-white font-medium truncate"
                                        title={t.name}
                                      >
                                        {t.name}
                                      </div>
                                      <div
                                        className="text-xs text-(--text-gray) truncate"
                                        title={t.artists}
                                      >
                                        {t.artists}
                                      </div>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Carrusel inferior */}
      <SongTicker />
    </div>
  );
}
