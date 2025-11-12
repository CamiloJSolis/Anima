// /frontend/src/components/UserMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import { LogOut, User, ChevronRight } from "lucide-react";

function initialsFrom(nameOrUser) {
  const base =
    nameOrUser?.name ||
    nameOrUser?.username ||
    nameOrUser?.email?.split("@")[0] ||
    "Usuario";
  const parts = base.trim().split(/\s+/);
  const ini =
    (parts[0]?.[0] || "") + (parts.length > 1 ? parts[1]?.[0] || "" : "");
  return ini.toUpperCase() || "US";
}

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // cerrar al hacer click afuera
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleProfile = () => {
    setOpen(false);
    navigate("/perfil");
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/login");
  };

  // Botón circular (avatar) en la barra
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={isAuthenticated ? (user?.username || "Mi cuenta") : "Invitado"}
        className={`
          w-10 h-10 rounded-xl grid place-items-center
          bg-white/10 hover:bg-white/15 border border-white/15
          transition
        `}
      >
        <span className="font-bold text-sm">
          {isAuthenticated ? initialsFrom(user) : "IN"}
        </span>
      </button>

      {open && (
        <div
          className="
            absolute left-12 top-0 z-50 w-64
            bg-white/5 backdrop-blur
            border border-white/10 rounded-xl shadow-xl p-3
          "
        >
          <div className="px-2 py-1">
            <div className="text-white font-semibold">
              {user?.username || user?.name || "Usuario"}
            </div>
            <div className="text-white/60 text-sm truncate">
              {user?.email || "—"}
            </div>
          </div>

          <hr className="my-2 border-white/10" />

          <button
            onClick={handleProfile}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <span className="flex items-center gap-2">
              <User size={16} /> Ver Perfil
            </span>
            <ChevronRight size={16} className="text-white/50" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-rose-300"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
