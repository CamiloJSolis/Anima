import React, { useState, useEffect, useRef } from 'react';
// 1. Importa los hooks y los íconos que usaremos
import { House, Music, Camera, UserRound, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../services/auth.jsx';

const Sidebar = () => {
  // 2. Obtén todo lo que necesitamos del contexto
  const { isAuthenticated, logout, user } = useAuth();
  
  // 3. Estado para manejar si el menú está abierto o cerrado
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null); // Referencia para el div del menú

  // 4. Hook para cerrar el menú si el usuario hace clic "fuera" de él
  useEffect(() => {
    function handleClickOutside(event) {
      const profileButton = document.getElementById('profile-menu-button');
      
      // Si el menú existe Y el clic NO fue dentro del menú
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Y el clic TAMPOCO fue en el botón que abre el menú
        if (profileButton && !profileButton.contains(event.target)) {
          setIsMenuOpen(false); // Cierra el menú
        }
      }
    }
    // Agrega el listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Limpia el listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]); // El efecto depende de la referencia al menú

  // Clases comunes para los íconos
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
      w-20 bg-black/80 backdrop-blur-[10px]
      flex flex-col items-center py-8 h-screen
      fixed left-0 top-0 z-1000
      gap-8 text-white
      max-md:w-full max-md:h-16 max-md:flex-row max-md:py-0 max-md:px-4 max-md:justify-evenly max-md:items-center max-md:gap-0
      max-md:bg-[rgba(0,0,20,0.80)] max-md:border-b max-md:border-white/10
    ">
      {/* Logo */}
      <div className="shrink-0 max-md:hidden">
        <img src={logo} alt="Anima Logo" className="h-15 w-15" />
      </div>

      <div className="
        flex flex-col gap-6 -skew-y-6 transition-transform duration-300 ease-in-out
        hover:-skew-y-3
        max-md:flex-row max-md:justify-center max-md:items-center max-md:gap-5 max-md:w-full max-md:transform-none
      ">
        
        {/* Enlaces Públicos */}
        <Link to="/" className={iconClassName} aria-label="Home">
          <House/>
        </Link>
        <Link to="/analizar" className={iconClassName} aria-label="Analizar">
          <Camera/>
        </Link>
        <Link to="/historial" className={iconClassName} aria-label="Historial">
          <Music/>
        </Link>

        {/* --- 5. LÓGICA DE AUTENTICACIÓN MEJORADA --- */}
        
        {isAuthenticated ? (
          // --- A. SI ESTÁ LOGUEADO (Menú de Perfil) ---
          <div className="relative" ref={menuRef}> {/* Contenedor relativo */}
            
            {/* 1. El botón que abre el menú */}
            <button
              id="profile-menu-button" // ID para el check de 'handleClickOutside'
              onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle
              className={iconClassName}
              aria-label="Menú de perfil"
            >
              <UserRound />
            </button>

            {/* 2. El menú desplegable (condicional) */}
            {isMenuOpen && (
              <div className="
                absolute left-full top-0 ml-3 w-56
                bg-[rgba(30,30,50,0.9)] backdrop-blur-md rounded-lg shadow-lg
                border border-white/10 p-2 z-10
                /* Estilos para móvil (abrir hacia abajo) */
                max-md:left-auto max-md:right-0 max-md:top-full max-md:mt-2 max-md:w-48
              ">
                {/* Header del menú */}
                <div className="p-2 border-b border-white/10 mb-2">
                  <p className="font-semibold text-white truncate" title={user?.username || 'Usuario'}>
                    {user?.username || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-400 truncate" title={user?.email || 'email@ejemplo.com'}>
                    {user?.email || 'email@ejemplo.com'}
                  </p>
                </div>
                
                {/* Opciones */}
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)} // Cierra al navegar
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-md"
                >
                  Ver Perfil
                  <ChevronRight size={16} />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md mt-1"
                >
                  Cerrar Sesión
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>

        ) : (
          
          // --- B. SI NO ESTÁ LOGUEADO (Link a Login) ---
          <Link to="/login" className={iconClassName} aria-label="Iniciar Sesión">
            <UserRound /> 
          </Link>

        )}
        
      </div>
    </nav>
  );
};

export default Sidebar;