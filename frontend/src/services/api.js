// /frontend/src/services/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:4000",
  withCredentials: true,
});

// --- Spotify: Top tracks para el carrusel ---
export const getSpotifyTopTracks = async () => {
  const res = await api.get("/auth/spotify/top-tracks");
  return res.data.tracks;
};
