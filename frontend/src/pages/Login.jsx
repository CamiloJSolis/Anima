import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Link as LinkIcon, LogIn, AlertCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Nuevos estados para feedback mejorado
  const [passwordStrength, setPasswordStrength] = useState(''); // '', 'weak', 'medium', 'strong'
  const [passwordErrors, setPasswordErrors] = useState([]); // Array de errores específicos
  const [confirmError, setConfirmError] = useState(''); // Error solo para confirmación
  const [fieldErrors, setFieldErrors] = useState({}); // Errores por campo: { email: '', username: '' }
  const [submitError, setSubmitError] = useState(''); // Error global solo para submit/backend

  // Detecta modo desde URL
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode && ['login', 'register'].includes(urlMode)) {
      setMode(urlMode);
    }
  }, [searchParams]);

  // Detecta si ya hay sesión activa
  const [authedUser, setAuthedUser] = useState(null);
  useEffect(() => {
    api.get('/auth/me')
      .then(res => setAuthedUser(res.data?.user || null))
      .catch(() => setAuthedUser(null));
  }, []);

  // Regex para contraseña fuerte
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Función para validar contraseña y actualizar strength/errores
  const validatePassword = (pwd) => {
    setPasswordErrors([]);
    let strength = '';
    let errors = [];

    if (pwd.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      errors.push('Al menos 1 minúscula (a-z)');
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      errors.push('Al menos 1 mayúscula (A-Z)');
    }
    if (!/(?=.*\d)/.test(pwd)) {
      errors.push('Al menos 1 número (0-9)');
    }
    if (!/(?=.*[@$!%*?&])/.test(pwd)) {
      errors.push('Al menos 1 símbolo (@$!%*?&)');
    }

    const totalReq = 5; // 4 reglas + longitud
    const metReq = (pwd.length >= 8 ? 1 : 0) + (/(?=.*[a-z])/.test(pwd) ? 1 : 0) + (/(?=.*[A-Z])/.test(pwd) ? 1 : 0) + (/(?=.*\d)/.test(pwd) ? 1 : 0) + (/(?=.*[@$!%*?&])/.test(pwd) ? 1 : 0);
    
    if (metReq === totalReq) {
      strength = 'strong';
    } else if (metReq >= 3) {
      strength = 'medium';
    } else if (metReq > 0) {
      strength = 'weak';
    }

    setPasswordStrength(strength);
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Handlers con validación en tiempo real
  const handlePasswordChange = (e) => {
    const newPwd = e.target.value;
    setPassword(newPwd);
    validatePassword(newPwd);
    if (confirmPassword) {
      setConfirmError(newPwd !== confirmPassword ? 'Las contraseñas no coinciden' : '');
    }
  };

  const handleConfirmChange = (e) => {
    const newConfirm = e.target.value;
    setConfirmPassword(newConfirm);
    setConfirmError(password !== newConfirm ? 'Las contraseñas no coinciden' : '');
  };

  const handleUsernameChange = (e) => {
    const newUser = e.target.value;
    setUsername(newUser);
    setFieldErrors(prev => ({ ...prev, username: newUser.trim().length < 3 ? 'Mínimo 3 caracteres' : '' }));
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setFieldErrors(prev => ({ ...prev, email: !emailRegex.test(newEmail) ? 'Email inválido' : '' }));
  };

  async function submit(e) {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});

    // Validaciones frontend antes de submit
    if (mode === 'register') {
      if (username.trim().length < 3) {
        setFieldErrors(prev => ({ ...prev, username: 'Mínimo 3 caracteres' }));
        return;
      }
      if (!validatePassword(password)) {
        return; // Errores ya mostrados en UI
      }
      if (password !== confirmPassword) {
        setConfirmError('Las contraseñas no coinciden');
        return;
      }
    }

    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : { username, email, password, confirmPassword };

      await api.post(url, payload);
      // Feedback de éxito (puedes añadir un toast aquí)
      window.location.href = '/';
    } catch (err) {
      // Mapeo de errores backend a mensajes amigables
      const backendMsg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error inesperado';
      let friendlyMsg = backendMsg;
      if (backendMsg.includes('password')) {
        friendlyMsg = 'Contraseña inválida. Debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.';
      } else if (backendMsg.includes('email')) {
        friendlyMsg = 'Email inválido o ya registrado.';
      } else if (backendMsg.includes('username')) {
        friendlyMsg = 'Usuario inválido o ya en uso.';
      }
      setSubmitError(friendlyMsg);
    }
  }

  // Spotify handlers (sin cambios)
  const SPOTIFY_BASE = 'http://127.0.0.1:4000/auth/spotify';
  function spotifyContinue() {
    window.location.href = `${SPOTIFY_BASE}/start`;
  }
  function spotifyLink() {
    window.location.href = `${SPOTIFY_BASE}/start?link=1`;
  }
  function toggleMode(newMode) {
    setMode(newMode);
    // Reset estados de feedback
    setSubmitError('');
    setPasswordErrors([]);
    setConfirmError('');
    setPasswordStrength('');
    setConfirmPassword('');
    setFieldErrors({});
    navigate(`?mode=${newMode}`);
  }

  const displayName =
    (authedUser?.username && authedUser.username) ||
    (authedUser?.email ? authedUser.email.split('@')[0] : null);

  // Helper para color de strength
  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'strong': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'weak': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-(--font-family) flex items-center justify-center p-5">
      <div className="bg-linear-to-br from-[rgba(138,43,226,0.4)] to-[rgba(0,191,255,0.3)] backdrop-blur-[10px] rounded-2xl p-10 w-full max-w-md text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(156,163,175,0.2)] max-md:p-8 max-md:m-2.5">
        <h1 className="text-2xl font-semibold text-(--text-primary) mb-2 max-md:text-xl">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>
        <p className="text-base text-(--text-gray) mb-8 max-md:text-sm">
          Coloca tus datos para {mode === 'login' ? 'iniciar sesión' : 'crear cuenta'}
        </p>

        {authedUser && (
          <div className="flex items-center gap-2 bg-[rgba(138,43,226,0.1)] border border-[rgba(138,43,226,0.2)] rounded-md p-3 mb-4 text-left">
            <LogIn size={16} />
            <span>Ya iniciaste sesión como <strong>@{displayName}</strong></span>
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4 mb-6">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-gray) z-10 pointer-events-none" size={20} />
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full pl-10 pr-3 h-12 py-3 leading-relaxed bg-[rgba(255,255,255,0.1)] border rounded-md text-(--text-primary) text-base transition-colors focus:outline-none placeholder:text-(--text-gray) ${
                    fieldErrors.username ? 'border-red-500' : 'border-[rgba(156,163,175,0.3)] focus:border-(--accent-violet)'
                  }`}
                  required
                />
              </div>
              {fieldErrors.username && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.username}
                </p>
              )}
            </>
          )}

          <>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-gray) z-10 pointer-events-none" size={20} />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-10 pr-3 h-12 py-3 leading-relaxed bg-[rgba(255,255,255,0.1)] border rounded-md text-(--text-primary) text-base transition-colors focus:outline-none placeholder:text-(--text-gray) ${
                  fieldErrors.email ? 'border-red-500' : 'border-[rgba(156,163,175,0.3)] focus:border-(--accent-violet)'
                }`}
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {fieldErrors.email}
              </p>
            )}
          </>

          <>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-gray) z-10 pointer-events-none" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full pl-10 pr-10 h-12 py-3 leading-relaxed bg-[rgba(255,255,255,0.1)] border rounded-md text-(--text-primary) text-base transition-colors focus:outline-none placeholder:text-(--text-gray) ${
                  passwordErrors.length > 0 ? 'border-red-500' : passwordStrength === 'strong' ? 'border-green-500' : 'border-[rgba(156,163,175,0.3)] focus:border-(--accent-violet)'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-(--text-gray) cursor-pointer p-0"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </>

          {/* Indicador de fuerza */}
          {mode === 'register' && password && (
            <div className="text-left text-xs space-y-1">
              <p className={`font-medium ${getStrengthColor(passwordStrength)}`}>
                Fuerza: {passwordStrength ? (passwordStrength === 'strong' ? 'Fuerte' : passwordStrength === 'medium' ? 'Media' : 'Débil') : 'Ninguna'}
              </p>
              {passwordErrors.length > 0 && (
                <ul className="text-red-500 space-y-0.5 list-disc list-inside">
                  {passwordErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
              {passwordStrength === 'strong' && (
                <p className="text-green-500">¡Excelente! Cumple todos los requisitos.</p>
              )}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-gray) z-10 pointer-events-none" size={20} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={handleConfirmChange}
                  className={`w-full pl-10 pr-10 h-12 py-3 leading-relaxed bg-[rgba(255,255,255,0.1)] border rounded-md text-(--text-primary) text-base transition-colors focus:outline-none placeholder:text-(--text-gray) ${
                    confirmError ? 'border-red-500' : 'border-[rgba(156,163,175,0.3)] focus:border-(--accent-violet)'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-(--text-gray) cursor-pointer p-0"
                  aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {confirmError}
                </p>
              )}
            </>
          )}

          {submitError && (
            <p className="text-red-500 text-sm m-0 text-left flex items-center gap-1">
              <AlertCircle size={16} /> {submitError}
            </p>
          )}

          {mode === 'login' && (
            <Link to="/forgot-paSsword" className="text-(--accent-violet) no-underline text-sm self-end hover:text-(--accent-blue) transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          )}

          <button
            type="submit"
            disabled={mode === 'register' && (passwordErrors.length > 0 || !!confirmError)} // Deshabilita si hay errores
            className={`
              border-none rounded-md py-3.5 text-base font-medium cursor-pointer transition-all duration-200 w-full
              ${mode === 'register' && (passwordErrors.length > 0 || !!confirmError) 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-linear-to-r from-(--accent-violet) to-(--accent-blue) text-white hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(138,43,226,0.4)] shadow-[0_4px_12px_rgba(138,43,226,0.3)]'
            }`}
          >
            {mode === 'login' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <div className="mt-6">
          {!authedUser ? (
            <button
              onClick={spotifyContinue}
              className="bg-[#22c55e] text-white border-none rounded-md py-3 text-sm cursor-pointer w-full transition-colors hover:bg-[#16a34a]"
            >
              Continuar con Spotify
            </button>
          ) : (
            <button
              onClick={spotifyLink}
              className="bg-[#22c55e] text-white border-none rounded-md py-3 text-sm cursor-pointer w-full transition-colors flex items-center justify-center gap-2 hover:bg-[#16a34a]"
            >
              <LinkIcon size={18} />
              <span>Vincular Spotify a mi cuenta</span>
            </button>
          )}
        </div>

        <p className="text-sm text-(--text-gray) mt-6 m-0 max-md:text-xs">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button Reset-Password
            type="button"
            onClick={() => toggleMode(mode === 'login' ? 'register' : 'login')}
            className="text-(--accent-violet) no-underline font-medium ml-1 transition-colors hover:text-(--accent-blue)"
          >
            {mode === 'login' ? ' Regístrate' : ' Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}