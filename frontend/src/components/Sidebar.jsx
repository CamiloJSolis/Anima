import React from 'react';
import { House, Music, Camera, UserRound, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // <- Esta ruta
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
      /* ... (todas tus clases de Tailwind) ... */
      w-20 bg-black/80 backdrop-blur-[10px]
      flex flex-col items-center py-8 h-screen
      fixed left-0 top-0 z-1000
      gap-8 text-white
      /* ... etc ... */
    ">
      {/* Logo */}
      <div className="shrink-0 max-md:hidden">
        <img src={logo} alt="Anima Logo" className="h-15 w-15" />
      </div>

      <div className="
        /* ... (todas tus clases de Tailwind) ... */
        flex flex-col gap-6 -skew-y-6 ... etc ...
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