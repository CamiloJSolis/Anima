import React from 'react';
import { Link } from 'react-router-dom';
import Aurora from '../components/Aurora.jsx';
import SongTicker from '../components/SongTicker.jsx';
import { Music } from 'lucide-react';  

const Home = () => {
  return (
    <div className="min-h-screen relative">
      <Aurora 
        colorStops={["#8A2BE2", "#00BFFF", "#F8BBD9"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      <div className="relative main-content">
        <main className="banner-container">
          <div className="banner">
            <div className="illustration">
              <div className="relative">
                <div className="illustration-placeholder">🎧</div>
                <div className="heart-badge">♥</div>
              </div>
              <div>
                <h2 className="title">Bienvenido a Ánima</h2>
                <p className="subtitle">Escucha música sin límites</p>
              </div>
            </div>

            <div>
              <p className="description">
                Disfruta de playlists personalizadas y descubre nueva música que se adapta a tu ánimo. ¡Empieza hoy!
              </p>
              <Link to="/analizar" className="btn-explore">
                <Music size={20} />
                Explorar Ahora
              </Link>
            </div>
          </div>
        </main>
        <SongTicker />
      </div>
    </div>
  );
};

export default Home;
