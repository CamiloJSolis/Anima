// /frontend/src/services/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:4000",
  withCredentials: true,
});

/* --------- Auth (sesión) --------- */
export const apiGetMe = async () => (await api.get("/auth/me")).data;
export const apiLogout = async () => (await api.post("/auth/logout")).data;

/* --------- Spotify (ticker carrusel) --------- */
export const getSpotifyTopTracks = async () => {
  const { data } = await api.get("/auth/spotify/top-tracks");
  return data.tracks; // [{ id, name, artists, image, url }]
};

/* --------- Historial / Resumen --------- */
export const getRecommendationHistory = async (
  { page = 1, limit = 20, emotion, sort = "recent" } = {}
) => {
  const params = { page, limit, sort };
  if (emotion) params.emotion = emotion;
  const { data } = await api.get("/recommendations/history", { params });
  return data || [];
};

export const getWeeklySummary = async () => {
  const { data } = await api.get("/recommendations/weekly-summary");
  return data || null;
};

/* --------- Resolver tracks por IDs (para tarjetas expandibles) --------- */
export const getSpotifyTracksByIds = async (ids = []) => {
  if (!ids.length) return [];
  try {
    // Implementa este endpoint en backend: GET /auth/spotify/tracks?ids=1,2,3
    const { data } = await api.get("/auth/spotify/tracks", {
      params: { ids: ids.join(",") },
    });
    return Array.isArray(data?.tracks) ? data.tracks : [];
  } catch {
    // Fallback (no rompe la UI)
    return ids.map((id) => ({
      id,
      name: "Track",
      artists: "",
      image: "/placeholder.jpg",
      url: `https://open.spotify.com/track/${id}`,
    }));
  }
};

/* --------- Perfil --------- */
export const updateProfile = async (payload) => {
  // Esperado en backend: PUT /users/me  ->  { user }
  const { data } = await api.put("/users/me", payload);
  return data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  // Esperado en backend: POST /users/change-password  -> { ok: true }
  const { data } = await api.post("/users/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
};
