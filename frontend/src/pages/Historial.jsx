// frontend/src/pages/Historial.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, History as HistoryIcon, Clock, ExternalLink, Music2 } from "lucide-react";
import { useAuth } from "../services/auth.jsx";
import { api } from "../services/api.js";

/* ------------------------------------------------------------------ */
/*  Estilos por emoción (ajústalo a tu paleta si quieres)             */
/* ------------------------------------------------------------------ */
const EMO_COLORS = {
  HAPPY: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CALM: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  SAD: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  ANGRY: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  FEAR: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  SURPRISE: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  CONFUSED: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  DISGUST: "bg-lime-500/20 text-lime-300 border-lime-500/30",
};

function EmotionChip({ emotion }) {
  const cls = EMO_COLORS[emotion] || "bg-white/10 text-white border-white/20";
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <Music2 size={14} />
      {emotion}
    </span>
  );
}

function formatDate(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

/* ------------------------------------------------------------------ */
/*  Hero “no autenticado” (como tu imagen 1)                          */
/* ------------------------------------------------------------------ */
function HeroNoAuth() {
  const navigate = useNavigate();
  return (
    <div
      className="
        min-h-screen bg-[var(--bg-primary)] text-white font-[var(--font-family)]
        flex flex-col items-center justify-center relative
        ml-20 w-[calc(100%-80px)] p-8
        max-md:ml-0 max-md:w-full max-md:pt-20 max-md:pb-24 max-md:p-4
      "
    >
      <p className="absolute top-4 left-4 text-[var(--text-gray)] max-md:hidden">
        ¡Hola, usuario! Inicia sesión para ver tu historial personalizado.
      </p>

      <LogIn size={96} className="text-[var(--accent-violet)] mb-6" />
      <h1 className="text-4xl font-bold mb-4 text-center max-md:text-3xl">
        Inicia sesión para ver tu historial
      </h1>
      <p className="text-lg text-[var(--text-gray)] mb-8 text-center max-md:text-base">
        Accede a tus análisis anteriores, emociones dominantes y recomendaciones personalizadas.
      </p>

      <div className="flex gap-4 max-md:flex-col max-md:w-full max-md:px-8">
        <button
          onClick={() => navigate("/login")}
          className="
            flex items-center justify-center gap-2
            px-8 py-3 rounded-full text-lg font-semibold
            bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-violet)] text-white
            transition-all duration-300 ease-in-out
            hover:opacity-90 hover:scale-105
            max-md:w-full max-md:px-4 max-md:py-2 max-md:text-base
          "
        >
          <LogIn size={20} /> Iniciar Sesión
        </button>

        <button
          onClick={() => navigate("/login?mode=register")}
          className="
            flex items-center justify-center gap-2
            px-8 py-3 rounded-full text-lg font-semibold
            bg-gray-700 text-white
            transition-all duration-300 ease-in-out
            hover:bg-gray-600 hover:scale-105
            max-md:w-full max-md:px-4 max-md:py-2 max-md:text-base
          "
        >
          <UserPlus size={20} /> Crear Cuenta
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vista principal                                                    */
/* ------------------------------------------------------------------ */
export default function Historial() {
  const { isAuthenticated, user } = useAuth();

  // Estado para historial real
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);

  // Cargar historial real solo si hay sesión
  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) {
      setSessions([]);
      setError(null);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/history");
        if (!mounted) return;
        setSessions(res.data?.sessions || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Error al cargar historial");
        setSessions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  // Resumen por emoción
  const summary = useMemo(() => {
    const counts = {};
    for (const s of sessions) counts[s.emotion] = (counts[s.emotion] || 0) + 1;
    const total = sessions.length || 1;
    const list = Object.entries(counts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
    return { total: sessions.length, list };
  }, [sessions]);

  // Si NO hay sesión → Hero
  if (!isAuthenticated) return <HeroNoAuth />;

  // Con sesión → vista pro
  return (
    <div
      className="
        min-h-screen bg-[var(--bg-primary)] text-white font-[var(--font-family)]
        flex flex-col relative
        ml-20 w-[calc(100%-80px)] p-8
        max-md:ml-0 max-md:w-full max-md:pt-20 max-md:pb-24 max-md:p-4
      "
    >
      {/* Saludo superior */}
      <p className="absolute top-4 left-4 text-[var(--text-gray)] max-md:hidden">
        ¡Hola, {user?.username || user?.name || "usuario"}! Aquí tienes tu actividad reciente.
      </p>

      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-7 h-7 text-[var(--accent-violet)]" />
          <div>
            <h1 className="text-3xl font-bold leading-tight">Historial</h1>
            <p className="text-sm text-white/60">
              Revisa tus análisis y playlists generadas.
            </p>
          </div>
        </div>
      </header>

      {/* Resumen de emociones */}
      <section className="mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Resumen de emociones</h2>

          {loading && summary.list.length === 0 && (
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 w-40 bg-white/10 rounded animate-pulse" />
              ))}
            </div>
          )}

          {!loading && summary.list.length === 0 ? (
            <p className="text-white/60 text-sm">
              Aún no hay análisis. ¡Analiza una foto para empezar!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {summary.list.map((item) => (
                <div
                  key={item.emotion}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <EmotionChip emotion={item.emotion} />
                    <span className="text-white/80 text-sm font-medium">
                      {item.count} · {item.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lista de sesiones */}
      <section className="space-y-4">
        {loading && (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse"
              >
                <div className="h-5 w-40 bg-white/10 rounded mb-4" />
                <div className="flex gap-3">
                  {[...Array(5)].map((__, j) => (
                    <div key={j} className="w-14 h-14 bg-white/10 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading &&
          sessions.map((s) => (
            <article
              key={s.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              {/* Cabecera de cada sesión */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <EmotionChip emotion={s.emotion} />
                  <span className="text-sm text-white/60 flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(s.analyzed_at)}
                  </span>
                  <span className="text-sm text-white/60">
                    · confianza {(Number(s.confidence) * 100).toFixed(0)}%
                  </span>
                </div>

                {s.playlist?.url && (
                  <a
                    href={s.playlist.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-violet-300 hover:text-violet-200 text-sm"
                  >
                    Ver playlist
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>

              {/* Carrusel horizontal de tracks */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {s.tracks?.map((t) => (
                  <a
                    key={t.id}
                    href={t.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      min-w-[260px] flex items-center gap-3
                      bg-white/5 border border-white/10 rounded-lg p-2
                      hover:bg-white/10 transition
                    "
                  >
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-14 h-14 rounded object-cover flex-shrink-0"
                      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{t.name}</p>
                      <p className="text-xs text-white/60 truncate">{t.artists}</p>
                    </div>
                  </a>
                ))}
              </div>
            </article>
          ))}

        {!loading && sessions.length === 0 && !error && (
          <p className="text-white/60">
            Aún no hay resultados. Ve a <span className="text-violet-300">Analizar</span> y genera recomendaciones.
          </p>
        )}

        {!loading && error && (
          <p className="text-rose-300">
            Ocurrió un error al cargar el historial.
          </p>
        )}
      </section>
    </div>
  );
}
