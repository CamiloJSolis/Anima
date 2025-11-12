// /frontend/src/components/SongTicker.jsx
import React, { useEffect, useState } from "react";
import "../styles/SongTicker.css";
import { getSpotifyTopTracks } from "../services/api.js";

// Fallback por si falla Spotify
const fallbackSongs = [
  { title: "Breathe Me",    artist: "Sia",             image: "/placeholder.jpg" },
  { title: "Cinnamon Girl", artist: "Lana Del Rey",    image: "/placeholder.jpg" },
  { title: "Rap God",       artist: "Eminem",          image: "/placeholder.jpg" },
  { title: "Faded",         artist: "Alan Walker",     image: "/placeholder.jpg" },
  { title: "Country Song",  artist: "Miranda Lambert", image: "/placeholder.jpg" },
  { title: "Diamonds",      artist: "Rihanna",         image: "/placeholder.jpg" },
  { title: "Bad Guy",       artist: "Billie Eilish",   image: "/placeholder.jpg" },
];

export default function SongTicker() {
  const [songs, setSongs] = useState(fallbackSongs);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const tracks = await getSpotifyTopTracks();
        if (!alive || !Array.isArray(tracks) || tracks.length === 0) return;

        const mapped = tracks.map((t) => ({
          title: t.name,
          artist: t.artists,
          image: t.image || "/placeholder.jpg",
          url: t.url || null,
        }));
        setSongs(mapped);
      } catch (e) {
        console.error("Spotify falló, usando fallback:", e?.message || e);
      }
    })();

    return () => { alive = false; };
  }, []);

  // Para que se vea continuo
  const display = [...songs, ...songs, ...songs];

  return (
    <div className="song-ticker">
      <div className="ticker-container">
        <div className="ticker-content">
          {display.map((s, i) => (
            <a
              key={i}
              className="ticker-item-image"
              href={s.url || "#"}
              target={s.url ? "_blank" : undefined}
              rel={s.url ? "noreferrer" : undefined}
            >
              {s.image && (
                <img
                  src={s.image}
                  alt={`${s.title} - ${s.artist}`}
                  className="ticker-image"
                />
              )}
              <span className="ticker-text">
                {s.title} - {s.artist}
              </span>
              <span className="separator">★</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
