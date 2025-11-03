import React from 'react';
import { Link } from 'react-router-dom';
import Aurora from '../components/Aurora.jsx';
import SongTicker from '../components/SongTicker.jsx';
import { Headphones } from 'lucide-react'; 

import '../styles/Home.css'; 

const Home = () => {
  return (
    <div className="min-h-screen relative">
      <Aurora 
        colorStops={["#8A2BE2", "#00BFFF", "#F8BBD9"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      
      {/* Contenedor principal con margen para el Sidebar */}
      <div className="relative main-content"> 
        <main className="banner-container">
          
          <div className="banner-centered">
            
            {/* BLOQUE SUPERIOR: ÍCONO y TÍTULOS */}
            <div className="welcome-block">
              <div className="icon-container-centered">
                <div className="illustration-icon-purple">
                  <Headphones size={60} className="icon-music-white" /> 
                </div>
              </div>
              
              <h1 className="title-hero">Bienvenido a Ánima</h1>
              <p className="subtitle-hero">Escucha música sin límites</p>
            </div>

            {/* BLOQUE INFERIOR: ESPECTATIVA Y ACCIÓN (Recuadro Morado) */}
            <div className="action-block-purple">
              <h2 className="tagline">Una foto, la banda sonora de tu alma</h2>
              
              <p className="description-text-centered">
                Analiza tu emoción, descubre tu música. Disfruta de playlists personalizadas y descubre nueva música que se adapta a tu ánimo. ¡Empieza hoy!
              </p>
            </div>
            
          </div>
        </main>
      </div>

      {/* CRÍTICO: Aplica la clase para alinear el carrusel */}
      <SongTicker className="song-ticker" /> 
    </div>
  );
};

export default Home;