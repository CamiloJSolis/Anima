import React from 'react';
import { Play, Edit3, MoreVertical } from 'lucide-react';
import '../styles/Historial.css';

export default function Historial() {
  // Datos mock para playlists (reemplaza con fetch de backend)
  const playlists = [
    { id: 1, title: 'Breathe Me', artist: 'Sia', thumbnail: '/breathe-me.jpg' },
    { id: 2, title: 'Cinnamon Girl', artist: 'Lana Del Rey', thumbnail: '/cinnamon-girl.jpg' },
    { id: 3, title: 'Country Song', artist: 'Miranda Lambert', thumbnail: '/country-song.jpg' },
    { id: 4, title: 'Bad Guy', artist: 'Billie Eilish', thumbnail: '/bad-guy.jpg' },
    { id: 5, title: 'Diamonds', artist: 'Rihanna', thumbnail: '/diamonds.jpg' },
    { id: 6, title: 'Rap God', artist: 'Eminem', thumbnail: '/rap-god.jpg' },
    { id: 7, title: 'Faded', artist: 'Alan Walker', thumbnail: '/faded.jpg' },
    { id: 8, title: 'Country Song', artist: 'Miranda Lambert', thumbnail: '/country-song-2.jpg' },
  ];

  return (
    <div className="historial-layout">
      {/* Header */}
      <header className="historial-header">
        <div className="header-content">
          <h1 className="welcome-title">¡Hola, usuario!</h1>
          <p className="welcome-text">Bienvenido a tus Playlists</p>
        </div>
      </header>

      {/* Main: Grid de Playlists */}
      <main className="historial-main">
        <div className="historial-section">
          <h2 className="section-title">Mis playlists</h2>
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="playlist-card">
                <div className="card-thumbnail">
                  <img src={playlist.thumbnail} alt={playlist.title} className="thumbnail-img" />
                  <button className="play-overlay">
                    <Play size={24} className="play-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{playlist.title}</h3>
                  <p className="card-artist">{playlist.artist}</p>
                  <div className="card-actions">
                    <button className="action-btn edit">
                      <Edit3 size={16} />
                    </button>
                    <button className="action-btn more">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}