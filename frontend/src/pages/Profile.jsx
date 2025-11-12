import React from 'react';
import { useAuth } from '../services/auth.jsx';
import { UserRound, Mail, AtSign, Calendar, Edit2, Lock, Camera } from 'lucide-react'; 

const Profile = () => {
  // --- 1. PRIMER CHECKPOINT ---
  console.log('Profile.jsx: Componente montado. Iniciando render.');

  const { user, isLoading: isAuthLoading } = useAuth(); 
  console.log('Profile.jsx: Estado de useAuth:', { user, isAuthLoading });

  if (isAuthLoading) {
    // --- 2. CHECKPOINT DE "CARGANDO" ---
    console.log('Profile.jsx: Renderizando estado "Cargando..."');
    return (
      <div className="... (clase de cargando) ...">
        Cargando perfil...
      </div>
    );
  }

  if (!user) {
    // --- 3. CHECKPOINT DE "SIN USUARIO" ---
    console.log('Profile.jsx: Renderizando estado "Sin Usuario". ¡Esto no debería pasar con el mock!');
    return (
      <div className="... (clase de 'no usuario') ...">
        <UserRound size={64} />
        <h2 className="text-2xl ...">No se ha encontrado información del usuario.</h2>
      </div>
    );
  }

  // --- 4. CHECKPOINT DE "ÉXITO" ---
  // Si vemos este log, el problema no es la lógica, es el JSX de abajo.
  console.log('Profile.jsx: Renderizando el perfil del usuario:', user.username);
  
  return (
    <div className="
      min-h-screen bg-(--bg-primary) text-(--text-primary) font-(--font-family)
      flex flex-col relative
      ml-20 w-[calc(100%-80px)] p-10
      max-md:ml-0 max-md:w-full max-md:pt-20 max-md:pb-24 max-md:p-6
    ">
      <h1 className="text-4xl font-bold mb-8 text-white max-md:text-3xl">Mi Perfil</h1>
      
      <div className="flex flex-col md:flex-row gap-8 max-w-[1000px] w-full mx-auto md:mx-0">
        
        {/* Columna Izquierda: Foto de Perfil y Acciones */}
        <div className="flex flex-col items-center p-6 bg-[rgba(30,30,50,0.5)] backdrop-blur-md border border-white/10 rounded-lg shadow-xl md:w-1/3">
          
          <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-(--accent-violet)">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.username}&background=8A2BE2&color=fff&size=128&rounded=true&bold=true`} 
              alt="Foto de perfil" 
              className="w-full h-full object-cover" 
            />
            <button className="absolute bottom-0 right-0 bg-(--accent-violet) p-1 rounded-full text-white">
              <Camera size={18} />
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-2">{user.username}</h2>
          <p className="text-md text-gray-400 mb-6">{user.email}</p>

          <div className="flex flex-col gap-3 w-full">
            <button className="flex items-center gap-3 px-4 py-2 bg-[rgba(138,43,226,0.2)] text-(--accent-violet) rounded-md transition-colors hover:bg-[rgba(138,43,226,0.3)]">
              <Edit2 size={18} />
              Editar Perfil
            </button>
            <button className="flex items-center gap-3 px-4 py-2 bg-[rgba(138,43,226,0.2)] text-(--accent-violet) rounded-md transition-colors hover:bg-[rgba(138,43,226,0.3)]">
              <Lock size={18} />
              Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Columna Derecha: Detalles del Perfil */}
        <div className="flex-1 p-6 bg-[rgba(30,30,50,0.5)] backdrop-blur-md border border-white/10 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Detalles de la Cuenta</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <UserRound size={16} /> Nombre
              </label>
              <p className="text-lg text-white font-medium break-words">{user.name || 'No especificado'}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <UserRound size={16} /> Apellido
              </label>
              <p className="text-lg text-white font-medium break-words">{user.lastName || 'No especificado'}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Mail size={16} /> Email
              </label>
              <p className="text-lg text-white font-medium break-words">{user.email}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <AtSign size={16} /> Nombre de Usuario
              </label>
              <p className="text-lg text-white font-medium break-words">{user.username}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Calendar size={16} /> Miembro desde
              </label>
              <p className="text-lg text-white font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Desconocido'}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;