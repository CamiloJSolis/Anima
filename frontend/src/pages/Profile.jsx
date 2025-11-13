// /frontend/src/pages/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../services/auth.jsx";
import { updateProfile, changePassword } from "../services/api.js";
import { Edit2, Lock, X, Loader2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

const [mode, setMode] = useState("view"); // 'view' | 'edit' | 'password'
const [banner, setBanner] = useState(null); // { type:'ok'|'err', msg:string } | null

  // Loading flags
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    username: "",
  });

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
    });
  }, [user]);

  const initials = useMemo(() => {
    const a = (user?.username || user?.email || "U")[0] || "U";
    return String(a).toUpperCase();
  }, [user]);

  function closeBanner() {
    setBanner(null);
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
      });
      setBanner({ type: "ok", msg: "Perfil actualizado correctamente." });
      setMode("view");
    } catch (err) {
      setBanner({ type: "err", msg: "No se pudo actualizar el perfil." });
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) {
      setBanner({ type: "err", msg: "Las contraseñas no coinciden." });
      return;
    }
    try {
      setChanging(true);
      await changePassword({
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setBanner({ type: "ok", msg: "Contraseña actualizada." });
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMode("view");
    } catch (err) {
      setBanner({ type: "err", msg: "No se pudo cambiar la contraseña." });
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="
      min-h-screen bg-(--bg-primary) text-(--text-primary) font-(--font-family)
      ml-20 w-[calc(100%-80px)] max-md:ml-0 max-md:w-full max-md:pt-20 max-md:pb-24
    ">
      <div className="px-4 md:px-6 pt-6">
        <h1 className="text-4xl font-bold text-white mb-6 max-md:text-3xl">Mi Perfil</h1>

        {/* Banner */}
        {banner && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border flex items-start gap-3 max-w-[1100px] mx-auto
              ${banner.type === "ok"
                ? "bg-green-900/20 border-green-700 text-green-200"
                : "bg-red-900/20 border-red-700 text-red-200"}`}
          >
            <span className="leading-6">{banner.msg}</span>
            <button
              onClick={closeBanner}
              className="ml-auto opacity-80 hover:opacity-100 transition"
              aria-label="Cerrar alerta"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Canvas central */}
        <section className="w-full max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">

          {/* Columna izquierda */}
          <aside className="bg-[rgba(30,30,50,0.5)] border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <div className="w-36 h-36 rounded-full bg-(--accent-violet)/70 text-white text-5xl grid place-items-center mx-auto mb-4">
              {initials}
            </div>
            <p className="text-center text-white font-semibold text-lg mb-1">
              {user?.username || "usuario"}
            </p>
            <p className="text-center text-(--text-gray) text-sm mb-6">{user?.email}</p>

            <div className="flex flex-col gap-3">
              {mode !== "edit" && (
                <button
                  onClick={() => setMode("edit")}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                             bg-(--accent-violet)/20 text-(--accent-violet) hover:bg-(--accent-violet)/30 transition"
                >
                  <Edit2 size={18} /> Editar Perfil
                </button>
              )}
              {mode !== "password" && (
                <button
                  onClick={() => setMode("password")}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                             bg-white/10 text-white hover:bg-white/15 transition"
                >
                  <Lock size={18} /> Cambiar Contraseña
                </button>
              )}
              {mode !== "view" && (
                <button
                  onClick={() => setMode("view")}
                  className="px-4 py-2 rounded-lg bg-white/5 text-(--text-gray) hover:bg-white/10 transition"
                >
                  Cerrar
                </button>
              )}
            </div>
          </aside>

          {/* Columna derecha */}
          <main className="bg-[rgba(30,30,50,0.5)] border border-white/10 rounded-xl p-6 backdrop-blur-md min-w-0">
            {/* VIEW */}
            {mode === "view" && (
              <>
                <h2 className="text-2xl font-semibold text-white mb-6">Detalles de la Cuenta</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nombre" value={user?.name || "No especificado"} />
                  <Field label="Apellido" value={user?.lastName || "No especificado"} />
                  <Field label="Usuario" value={user?.username || "No especificado"} />
                  <Field label="Miembro desde" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Desconocido"} />
                </div>
              </>
            )}

            {/* EDIT */}
            {mode === "edit" && (
              <form onSubmit={onSaveProfile} className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">Editar datos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <Input
                    label="Apellido"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                  <Input
                    label="Usuario"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-(--accent-violet) text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Guardando</span> : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    className="px-5 py-2 rounded-lg bg-white/10 text-(--text-primary) hover:bg-white/15"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* PASSWORD */}
            {mode === "password" && (
              <form onSubmit={onChangePassword} className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">Cambiar contraseña</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contraseña actual"
                    type="password"
                    value={pwd.currentPassword}
                    onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Nueva contraseña"
                      type="password"
                      value={pwd.newPassword}
                      onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                    />
                    <Input
                      label="Confirmar nueva"
                      type="password"
                      value={pwd.confirmPassword}
                      onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={changing}
                    className="px-5 py-2 rounded-lg bg-(--accent-violet) text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {changing ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Cambiando</span> : "Cambiar contraseña"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    className="px-5 py-2 rounded-lg bg-white/10 text-(--text-primary) hover:bg-white/15"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </main>
        </section>
      </div>
    </div>
  );
}

/* ------- UI helpers ------- */
function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <label className="text-sm text-(--text-gray) mb-1 block">{label}</label>
      <div className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white truncate">
        {value}
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm text-(--text-gray) mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none
                   focus:border-(--accent-violet) transition"
      />
    </label>
  );
}
