import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Facebook, Instagram, Twitter, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Login.css';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');              // NEW
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // NEW
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);      // NEW
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'register') {
        // Validaciones rápidas en frontend
        if (username.trim().length < 3) {
          setError('El usuario debe tener al menos 3 caracteres');
          return;
        }
        if (password.length < 8) {
          setError('La contraseña debe tener mínimo 8 caracteres');
          return;
        }
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }
      }

      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : { username, email, password, confirmPassword };

      await api.post(url, payload);
      window.location.href = '/';
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Error al procesar la solicitud';
      setError(msg);
    }
  }

  function linkSpotify() {
    window.location.href = 'http://localhost:4000/auth/spotify/start';
  }

  return (
    <div className="login-layout">
      <div className="login-box">
        <h1 className="login-title">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        <p className="login-subtitle">
          Coloca tus datos para {mode === 'login' ? 'iniciar sesión' : 'crear cuenta'}
        </p>

        <form onSubmit={submit} className="login-form">
          {mode === 'register' && (
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
                required
              />
            </div>
          )}

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === 'register' && (
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="login-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="password-toggle"
                aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          {error && <p className="login-error">{error}</p>}

          {mode === 'login' && (
            <Link to="#" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          )}

          <button type="submit" className="login-button">
            {mode === 'login' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <div className="spotify-link">
          <button onClick={linkSpotify} className="spotify-button">
            Vincular o entrar con Spotify
          </button>
        </div>

        <p className="register-link">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <Link
            to="#"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
              setConfirmPassword('');
            }}
            className="register-text"
          >
            {mode === 'login' ? ' Regístrate' : ' Inicia sesión'}
          </Link>
        </p>
      </div>
    </div>
  );
}
