import React, { memo, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Aurora from '../components/Aurora.jsx';
import { Headphones, Camera } from 'lucide-react'; 

// Reusable IconWrapper with Tailwind
const IconWrapper = ({ icon: Icon, size = 60, className = "" }) => (
  <div className={`relative inline-block mb-5 ${className}`}>
    <div className="
      bg-(--accent-violet) rounded-full w-30 h-30
      flex justify-center items-center mx-auto
      shadow-[0_0_25px_rgba(138,43,226,0.8)]
      transition-all duration-300 hover:scale-105
      /* Mobile: Slightly smaller */
      max-md:w-24 max-md:h-24
    ">
      <Icon size={size} className="text-white drop-shadow-sm" aria-hidden="true" />
    </div>
  </div>
);

const LazySongTicker = React.lazy(() => import('../components/SongTicker.jsx'));

const Home = memo(() => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      <Aurora 
        colorStops={["#8A2BE2", "#00BFFF", "#F8BBD9"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      
      {/* Main content with sidebar offset */}
      <div className="
        relative z-100 text-white
        flex justify-center items-center
        /* Desktop: Sidebar offset */
        ml-20 w-[calc(100%-80px)] h-screen
        /* Mobile: Full width */
        max-md:ml-0 max-md:w-full
      "> 
        <main className="
          flex justify-center items-center w-full
          mb-20 text-center
        ">
          <div className="
            flex flex-col items-center text-center
            max-w-[800px] w-[90%] px-0 py-10 mx-auto
            /* Mobile adjustments */
            max-md:w-[95%] max-md:py-5
          ">
            
            {/* Welcome Block */}
            <div className="mb-10 w-full text-center">
              <IconWrapper icon={Headphones} />
              
              <h1 className="
                text-6xl font-bold text-white mb-0 mt-4
                drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]
                bg-linear-to-r from-white to-gray-200 bg-clip-text
                /* Mobile: Responsive sizing */
                max-md:text-5xl max-sm:text-4xl
              ">
                Bienvenido a Ánima
              </h1>
              <p className="
                text-xl text-gray-300 mt-1.25
                drop-shadow-[0_0_5px_rgba(0,0,0,0.9)]
                max-sm:text-lg
              ">
                Escucha música sin límites
              </p>
            </div>

            {/* Action Block (Enhanced Purple Card) */}
            <div className="
              bg-linear-to-br from-[rgba(138,43,226,0.4)] to-[rgba(0,191,255,0.3)]
              backdrop-blur-sm rounded-b-[10px] border border-white/5
              w-[calc(100%+40px)] -ml-5 -mr-5
              p-8 px-12
              flex flex-col items-center text-center
              shadow-[0_10px_30px_rgba(0,0,0,0.6)]
              transition-all duration-300 hover:shadow-[0_15px_40px_rgba(138,43,226,0.5)]
              /* Mobile: Full width, rounded, adjusted padding */
              max-md:w-full max-md:ml-0 max-md:mr-0 max-md:rounded-[10px] max-md:px-8 max-md:py-5
            ">
              <IconWrapper 
                icon={Camera} 
                size={40} 
                className="mb-4 scale-90 opacity-90"
              />
              
              <h2 className="
                text-2xl font-bold text-white mb-4
                drop-shadow-[0_0_8px_rgba(0,0,0,0.7)]
                bg-linear-to-r from-white to-blue-200 bg-clip-text
              ">
                Una foto, la banda sonora de tu alma
              </h2>
              
              <p className="
                text-base text-gray-200 leading-relaxed mb-6
                max-sm:text-sm max-sm:mb-5
              ">
                Analiza tu emoción, descubre tu música. Disfruta de playlists personalizadas y descubre nueva música que se adapta a tu ánimo.
              </p>
              
              <button className="
                analyze-button group
                inline-flex items-center
                bg-linear-to-r from-(--accent-violet) to-(--accent-blue)
                text-white px-6 py-3 rounded-[25px]
                text-lg font-semibold no-underline
                transition-all duration-300 ease-in-out
                shadow-[0_4px_15px_rgba(138,43,226,0.5)]
                hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(138,43,226,0.7)]
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-4 focus:ring-(--accent-violet)/30
                max-sm:px-5 max-sm:py-2.5 max-sm:text-base
              " role="button">
                <Link to="/analizar" className="flex items-center">
                  ¡Empieza hoy!
                </Link>
              </button>
            </div>
          </div>
        </main>
      </div>

      <Suspense fallback={
        <div className="
          fixed bottom-0 left-20 right-0 z-200
          bg-black/80 p-2.5 overflow-hidden
          text-center text-gray-400 text-sm
          max-md:left-0
          animate-pulse
        ">Loading vibes...</div>
      }>
        <LazySongTicker className="
          fixed bottom-0 left-20 right-0 z-200
          bg-black/80 backdrop-blur-md p-2.5 overflow-x-auto
          border-t border-white/10
          /* Mobile: Full width */
          max-md:left-0
          /* Subtle entrance animation */
          animate-in slide-in-from-bottom-2 duration-500
        " /> 
      </Suspense>
    </div>
  );
});

export default Home;