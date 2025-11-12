// /frontend/src/services/api.js
import axios from "axios";

export const api = axios.create({
  // si configuras VITE_API_BASE, la usa; si no, cae al localhost:4000
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000",
  withCredentials: true,
});

/* ------------------------- Auth helpers ------------------------- */
export const apiGetMe = async () => {
  const r = await api.get("/auth/me");
  return r.data?.user ?? null;
};

export const apiLogout = async () => {
  // limpia cookie httpOnly en el backend
  await api.post("/auth/logout");
};

/* ------------------- Spotify: carrusel de tracks ------------------- */
export const getSpotifyTopTracks = async () => {
  const { data } = await api.get("/auth/spotify/top-tracks");
  return data?.tracks ?? []; // array de { id, name, artists, image, url }
};


// Historial y resumen (si no los tienes ya como helpers)
export const getRecommendationHistory = async (page = 1, limit = 20) => {
  const { data } = await api.get(`/recommendations/history`, { params: { page, limit } });
  return data;
};

export const getWeeklySummary = async () => {
  const { data } = await api.get(`/recommendations/weekly-summary`);
  return data;
};

// Resolver varios tracks por IDs (usa el endpoint nuevo)
export const getSpotifyTracksByIds = async (ids = [], market = 'MX') => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const { data } = await api.get(`/auth/spotify/tracks`, {
    params: { ids: ids.join(','), market }
  });
  return data.tracks || [];
};

