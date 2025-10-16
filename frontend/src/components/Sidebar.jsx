import React from 'react';
import { House, Music, Camera, UserRound, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css'; 

const Sidebar = () => {
  return (
    <nav className="sidebar">

        {/* Logo integrado como SVG - Idea #1: Silueta de cara transformándose en ondas sonoras */}
      <div className="logo">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Silueta abstracta de cara */}
          <path d="M20 10C15 10 12 13 12 18C12 23 15 26 20 26C25 26 28 23 28 18C28 13 25 10 20 10Z" fill="white" opacity="0.9"/>
          {/* Ojo con flash de cámara */}
          <circle cx="20" cy="16" r="2" fill="#FFD700"/>
          <circle cx="20" cy="16" r="1" fill="black"/>
          {/* Ondas sonoras saliendo */}
          <path d="M28 18C30 18 32 19 32 20C32 21 30 22 28 22M12 18C10 18 8 19 8 20C8 21 10 22 12 22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Texto 'Ánima' curvado (simplificado) */}
          <text x="20" y="35" textAnchor="middle" fill="white" fontSize="12" fontFamily="serif">Ánima</text>
        </svg>
      </div>

      <div className="nav-icons">
        <Link to="/" className="icon">
          <House />
        </Link>
        <Link to="/analizar" className="icon">
          <Camera />
        </Link>
        <Link to="/historial" className="icon">
          <Music />
        </Link>
        <Link to="/" className="icon">
          <UserRound />
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;