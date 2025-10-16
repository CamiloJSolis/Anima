import React, { useEffect, useState } from 'react';
import { Play, Edit3, MoreVertical } from 'lucide-react';
import '../styles/Historial.css';
import SongTicker from '../components/SongTicker.jsx';
import { api } from '../services/api';

export default function Historial({ user: userProp = null }) {
  const [user, setUser] = useState(userProp);

  useEffect(() => {
    if (!userProp) {
      api.get('/auth/me')
        .then(res => setUser(res.data?.user || null))
        .catch(() => setUser(null));
    }
  }, [userProp]);

  const displayName =
    (user?.username && user.username.trim()) ||
    (user?.name && user.name.trim()) ||
    (user?.email ? user.email.split('@')[0] : 'invitado');

  // Datos mock para playlists (reemplaza con fetch de backend)
  const playlists = [
    { id: 1, title: 'Breathe Me', artist: 'Sia', thumbnail: 'sia.jpg' },
    { id: 2, title: 'Cinnamon Girl', artist: 'Lana Del Rey', thumbnail: 'Cinnamon Girl.jpg' },
    { id: 3, title: 'Country Song', artist: 'Miranda Lambert', thumbnail: 'Country Song.jpg' },
    { id: 4, title: 'Bad Guy', artist: 'Billie Eilish', thumbnail: 'Bad Guy.jpg' },
    { id: 5, title: 'Diamonds', artist: 'Rihanna', thumbnail: 'Diamonds.jpg' },
    { id: 6, title: 'Rap God', artist: 'Eminem', thumbnail: '/placeholder.jpg' },
    { id: 7, title: 'Faded', artist: 'Alan Walker', thumbnail: 'Faded.jpg' },
    { id: 8, title: 'Country Song', artist: 'Miranda Lambert', thumbnail: 'CountrySonggg.jpg' },
  ];

  return (
    <div className="historial-layout">
      {/* Header */}
      <header className="historial-header">
        <div className="header-content">
          <h1 className="welcome-title">¡Hola, {displayName}!</h1>
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