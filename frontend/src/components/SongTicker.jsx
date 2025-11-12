// /frontend/src/components/SongTicker.jsx
import React, { useEffect, useState } from "react";
import "../styles/SongTicker.css";
import { getSpotifyTopTracks } from "../services/api.js";

// Fallback por si falla la API de Spotify
const fallbackSongs = [
  { title: "Breathe Me",    artist: "Sia",             image: "sia.jpg" },
  { title: "Cinnamon Girl", artist: "Lana Del Rey",    image: "Cinnamon Girl.jpg" },
  { title: "Rap God",       artist: "Eminem",          image: "placeholder.jpg" },
  { title: "Faded",         artist: "Alan Walker",     image: "Faded.jpg" },
  { title: "Country Song",  artist: "Miranda Lambert", image: "Country Song.jpg" },
  { title: "Diamonds",      artist: "Rihanna",         image: "Diamonds.jpg" },
  { title: "Bad Guy",       artist: "Billie Eilish",   image: "Bad Guy.jpg" },
];

const SongTicker = () => {
  const [songs, setSongs] = useState(fallbackSongs);

  useEffect(() => {
    let isMounted = true;

    const fetchSongs = async () => {
      try {
        const tracks = await getSpotifyTopTracks();

        if (!isMounted || !tracks || tracks.length === 0) return;

        // Adaptamos los campos al shape que usa el componente
        const mapped = tracks.map((t) => ({
          title: t.name,
          artist: t.artists,
          image: t.image || null,     // si no hay imagen, no se muestra la <img>
          url: t.url || null,
        }));

        setSongs(mapped);
      } catch (err) {
        console.error(
          "No se pudieron cargar canciones de Spotify, usando fallback:",
          err
        );
        // Si falla, se queda con fallbackSongs
      }
    };

    fetchSongs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Trucazo para que el carrusel se vea continuo: repetir la lista
  const displaySongs = [...songs, ...songs, ...songs];

  return (
    <div className="song-ticker">
      <div className="ticker-container">
        <div className="ticker-content">
          {displaySongs.map((song, index) => (
            <a
              key={index}
              className="ticker-item-image"
              href={song.url || "#"}
              target={song.url ? "_blank" : undefined}
              rel={song.url ? "noreferrer" : undefined}
            >
              {song.image && (
                <img
                  src={song.image}
                  alt={`${song.title} - ${song.artist}`}
                  className="ticker-image"
                />
              )}
              <span className="ticker-text">
                {song.title} - {song.artist}
              </span>
              <span className="separator">★</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SongTicker;
