import React from 'react';
import { House, Music, Camera, UserRound, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../services/auth'; 

const Sidebar = () => {
  const { isAuthenticated, logout } = useAuth();

  const iconClassName = `
    p-2 rounded-lg text-(--text-gray) cursor-pointer
    flex items-center justify-center
    transition-[color,background-color,opacity,transform] duration-[0.2s,0.3s,0.3s,0.3s] ease-in-out
    hover:text-(--accent-violet) hover:bg-white/20 hover:opacity-90 hover:scale-110
    max-md:p-2.5 max-md:rounded-xl
    max-md:hover:bg-white/20 max-md:hover:opacity-90 max-md:hover:scale-110
    max-md:active:bg-white/30 max-md:active:opacity-90 max-md:active:scale-110
  `;

  return (
    <nav className="
      /* Desktop: Vertical sidebar */
      w-20 bg-black/80 backdrop-blur-[10px]
      flex flex-col items-center py-8 h-screen
      fixed left-0 top-0 z-1000
      gap-8 text-white

      /* Mobile: Horizontal top bar */
      max-md:top-0 max-md:bottom-auto max-md:h-16 max-md:w-full max-md:flex-row
      max-md:py-0 max-md:px-4 max-md:justify-evenly max-md:items-center max-md:gap-0
      max-md:bg-[rgba(0,0,20,0.80)] max-md:border-b max-md:border-white/10
    ">
      {/* Logo */}
      <div className="shrink-0 max-md:hidden">
        <img src={logo} alt="Anima Logo" className="h-15 w-15" />
      </div>

      <div className="
/* Desktop: Column with skew */
        flex flex-col gap-6 -skew-y-6 transition-transform duration-300 ease-in-out
        hover:-skew-y-3

        /* Mobile: Row, no skew, full width spacing */
        max-md:flex-row max-md:justify-center max-md:items-center max-md:gap-0 max-md:w-full max-md:transform-none
      ">
        
        {/* === ENLACES PÚBLICOS (Siempre visibles) === */}
        <Link to="/" className={iconClassName} aria-label="Home">
          <House/>
        </Link>
        <Link to="/analizar" className={iconClassName} aria-label="Analizar">
          <Camera/>
        </Link>
        <Link to="/historial" className={iconClassName} aria-label="Historial">
          <Music/>
        </Link>

        {/* === LÓGICA CONDICIONAL DE AUTENTICACIÓN === */}
        {isAuthenticated ? (
          // ----- A. SI EL USUARIO ESTÁ LOGUEADO -----
          <>
            <Link to="/profile" className={iconClassName} aria-label="Perfil">
              <UserRound/>
            </Link>
            <button 
              onClick={logout} 
              className={iconClassName} 
              aria-label="Cerrar Sesión"
            >
              <LogOut />
            </button>
          </>
        ) : (
          // ----- B. SI EL USUARIO NO ESTÁ LOGUEADO -----
          <>
            <Link to="/login" className={iconClassName} aria-label="Iniciar Sesión">
              <UserRound /> 
            </Link>
          </>
        )}
        
      </div>
    </nav>
  );
};

export default Sidebar;