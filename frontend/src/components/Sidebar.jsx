import React from 'react';
import { House, Music, Camera, UserRound, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Sidebar = () => {
  return (
    <nav className="
      /* Desktop: Vertical sidebar (base, md+ overrides if needed, but here base is desktop) */
      w-20 bg-black/80 backdrop-blur-[10px]
      flex flex-col items-center py-8 h-screen
      fixed left-0 top-0 z-1000
      gap-8 text-white
      transition-all duration-300 ease-in-out

      /* Mobile: Top navigation bar (≤768px) */
      max-md:w-full max-md:h-16 max-md:flex-row max-md:py-0 max-md:px-4 max-md:justify-evenly max-md:items-center max-md:gap-0
      max-md:bg-[rgba(0,0,20,0.80)] max-md:border-b max-md:border-white/10
    ">
      {/* Logo - hidden on mobile */}
      <div className="shrink-0 max-md:hidden">
        <img src={logo} alt="Anima Logo" className="h-15 w-15" />
      </div>

      <div className="
        /* Desktop: Column with skew */
        flex flex-col gap-6 -skew-y-6 transition-transform duration-300 ease-in-out
        hover:-skew-y-3

        /* Mobile: Row, no skew */
        max-md:flex-row max-md:justify-center max-md:items-center max-md:gap-5 max-md:w-full max-md:transform-none
      ">
        <Link to="/" className="
          /* Shared base */
          p-2 rounded-lg text-(--text-gray) cursor-pointer
          flex items-center justify-center
          transition-[color,background-color,opacity,transform] duration-[0.2s,0.3s,0.3s,0.3s] ease-in-out

          /* Desktop hover */
          hover:text-(--accent-violet) hover:bg-white/20 hover:opacity-90 hover:scale-110

          /* Mobile overrides */
          max-md:p-2.5 max-md:rounded-xl
          max-md:hover:bg-white/20 max-md:hover:opacity-90 max-md:hover:scale-110
          max-md:active:bg-white/30 max-md:active:opacity-90 max-md:active:scale-110
        ">
          <House/>
        </Link>

        <Link to="/analizar" className="
          /* Shared base */
          p-2 rounded-lg text-(--text-gray) cursor-pointer
          flex items-center justify-center
          transition-[color,background-color,opacity,transform] duration-[0.2s,0.3s,0.3s,0.3s] ease-in-out

          /* Desktop hover */
          hover:text-(--accent-violet) hover:bg-white/20 hover:opacity-90 hover:scale-110

          /* Mobile overrides */
          max-md:p-2.5 max-md:rounded-xl
          max-md:hover:bg-white/20 max-md:hover:opacity-90 max-md:hover:scale-110
          max-md:active:bg-white/30 max-md:active:opacity-90 max-md:active:scale-110
        ">
          <Camera/>
        </Link>

        <Link to="/historial" className="
          /* Shared base */
          p-2 rounded-lg text-(--text-gray) cursor-pointer
          flex items-center justify-center
          transition-[color,background-color,opacity,transform] duration-[0.2s,0.3s,0.3s,0.3s] ease-in-out

          /* Desktop hover */
          hover:text-(--accent-violet) hover:bg-white/20 hover:opacity-90 hover:scale-110

          /* Mobile overrides */
          max-md:p-2.5 max-md:rounded-xl
          max-md:hover:bg-white/20 max-md:hover:opacity-90 max-md:hover:scale-110
          max-md:active:bg-white/30 max-md:active:opacity-90 max-md:active:scale-110
        ">
          <Music/>
        </Link>

        <Link to="/login" className="
          /* Shared base */
          p-2 rounded-lg text-(--text-gray) cursor-pointer
          flex items-center justify-center
          transition-[color,background-color,opacity,transform] duration-[0.2s,0.3s,0.3s,0.3s] ease-in-out

          /* Desktop hover */
          hover:text-(--accent-violet) hover:bg-white/20 hover:opacity-90 hover:scale-110

          /* Mobile overrides */
          max-md:p-2.5 max-md:rounded-xl
          max-md:hover:bg-white/20 max-md:hover:opacity-90 max-md:hover:scale-110
          max-md:active:bg-white/30 max-md:active:opacity-90 max-md:active:scale-110
        ">
          <UserRound/>
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;