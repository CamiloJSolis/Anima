import React from 'react';
import { Link } from 'react-router-dom';
import Aurora from '../components/Aurora.jsx';
import { Music, Twitter, Instagram, Facebook } from 'lucide-react';  

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

        <footer className="footer" style={{ zIndex: 10, position: 'relative' }}>
          <a href="/privacy" className="footer-link">Privacidad y políticas del sitio</a>
          <div className="social-icons">
            <button className="social-btn"><Twitter size={20}/></button>
            <button className="social-btn"><Instagram size={20}/></button>
            <button className="social-btn"><Facebook size={20}/></button>
          </div>
          <a href="/terms" className="footer-link">Términos y condiciones</a>
        </footer>
      </div>
    </div>
  );
};

export default Home;
