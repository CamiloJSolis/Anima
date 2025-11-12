// /frontend/src/pages/Profile.jsx
import React from "react";
import { useAuth } from "../services/auth.jsx";
import { UserRound, Mail, AtSign, Calendar, Edit2, Lock, Camera } from "lucide-react";

function initialsFrom(user) {
  const base =
    user?.name || user?.username || user?.email?.split("@")[0] || "Usuario";
  const p = base.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() || "US";
}

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg-primary) text-white grid place-items-center">
        <p className="opacity-80">Cargando perfil…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-(--bg-primary) text-white grid place-items-center">
        <div className="text-center">
          <UserRound className="mx-auto mb-3" size={56} />
          <p className="text-lg">No se ha encontrado información del usuario.</p>
        </div>
      </div>
    );
  }

  const displayName = user?.username || user?.name || "usuario";
  const email = user?.email || "—";
  const memberSince = user?.created_at || user?.member_since || user?.joined_at;

  return (
    <div className="
      min-h-screen bg-(--bg-primary) text-(--text-primary) font-(--font-family)
      flex flex-col relative
      ml-20 w-[calc(100%-80px)] p-10
      max-md:ml-0 max-md:w-full max-md:pt-20 max-md:pb-24 max-md:p-6
    ">
      <h1 className="text-4xl font-bold mb-8 text-white max-md:text-3xl">Mi Perfil</h1>

      <div className="flex flex-col md:flex-row gap-8 max-w-[1000px] w-full mx-auto md:mx-0">
        {/* Tarjeta izquierda */}
        <section className="flex flex-col items-center p-6 bg-[rgba(30,30,50,0.5)] backdrop-blur-md border border-white/10 rounded-lg shadow-xl md:w-1/3">
          <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-(--accent-violet) grid place-items-center bg-(--accent-violet)">
            <span className="text-5xl font-extrabold text-white select-none">
              {initialsFrom(user)}
            </span>
            <button
              className="absolute bottom-1 right-1 bg-(--accent-violet) p-2 rounded-full text-white/90 hover:text-white/100"
              title="Cambiar foto (pendiente)"
            >
              <Camera size={18} />
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-2">{displayName}</h2>
          <p className="text-md text-gray-400 mb-6">{email}</p>

          <div className="flex flex-col gap-3 w-full">
            <button
              className="flex items-center gap-3 px-4 py-2 bg-[rgba(138,43,226,0.2)] text-(--accent-violet) rounded-md transition-colors hover:bg-[rgba(138,43,226,0.3)]"
              onClick={() => alert("Editar perfil (pendiente)")}
            >
              <Edit2 size={18} />
              Editar Perfil
            </button>
            <button
              className="flex items-center gap-3 px-4 py-2 bg-[rgba(138,43,226,0.2)] text-(--accent-violet) rounded-md transition-colors hover:bg-[rgba(138,43,226,0.3)]"
              onClick={() => alert("Cambiar contraseña (pendiente)")}
            >
              <Lock size={18} />
              Cambiar Contraseña
            </button>
          </div>
        </section>

        {/* Tarjeta derecha */}
        <section className="flex-1 p-6 bg-[rgba(30,30,50,0.5)] backdrop-blur-md border border-white/10 rounded-lg shadow-xl">
          <h3 className="text-2xl font-semibold text-white mb-6">Detalles de la Cuenta</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <UserRound size={16} /> Nombre
              </label>
              <p className="text-lg text-white font-medium break-words">
                {user?.name || "No especificado"}
              </p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <UserRound size={16} /> Apellido
              </label>
              <p className="text-lg text-white font-medium break-words">
                {user?.lastName || "No especificado"}
              </p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Mail size={16} /> Email
              </label>
              <p className="text-lg text-white font-medium break-words">{email}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <AtSign size={16} /> Nombre de Usuario
              </label>
              <p className="text-lg text-white font-medium break-words">
                {user?.username || displayName}
              </p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Calendar size={16} /> Miembro desde
              </label>
              <p className="text-lg text-white font-medium">
                {memberSince ? new Date(memberSince).toLocaleDateString() : "Desconocido"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
