import React from 'react';
import '../styles/SongTicker.css';

const songs = [
  // Cambia la URL externa por la ruta local de tu imagen de prueba
  { title: "Breathe Me", artist: "Sia", image: "sia.jpg" }, 
  { title: "Cinnamon Girl", artist: "Lana Del Rey", image: "Cinnamon Girl.jpg" },
  { title: "Rap God", artist: "Eminem", image: "/placeholder.jpg" },
  { title: "Faded", artist: "Alan Walker", image: "Faded.jpg" },
  { title: "Country Song", artist: "Miranda Lambert", image: "Country Song.jpg" },
  { title: "Diamonds", artist: "Rihanna", image: "Diamonds.jpg" },
  { title: "Bad Guy", artist: "Billie Eilish", image: "Bad Guy.jpg" }
];

const SongTicker = () => {
  const displaySongs = [...songs, ...songs, ...songs];

  return (
    <div className="ticker-container">
      <div className="ticker-content">
        {displaySongs.map((song, index) => (
          <div key={index} className="ticker-item-image">
            {/* La etiqueta img ahora usa la ruta local */}
            <img src={song.image} alt={`${song.title} - ${song.artist}`} className="ticker-image" />
            <span className="ticker-text">
              {song.title} - {song.artist}
            </span>
            <span className="separator">★</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongTicker;