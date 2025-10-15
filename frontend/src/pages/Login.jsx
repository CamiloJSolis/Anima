import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Facebook, Instagram, Twitter } from 'lucide-react';  // Íconos de Lucide
import { Link } from 'react-router-dom';  // Para enlace a registro (si usas rutas)
import { api } from '../services/api';  // Tu API service
import '../styles/Login.css';  // Importa el CSS

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);  // Para toggle password

  async function submit(e) {
    e.preventDefault();
    setError(null);  // Limpia error anterior
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      await api.post(url, { email, password });
      window.location.href = '/'; // o usa navigate('/') si tenés React Router
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud');
    }
  }

  function linkSpotify() {
    window.location.href = 'http://localhost:4000/auth/spotify/start';
  }

  return (
    <div className="login-layout">
      <div className="login-box">
        <h1 className="login-title">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        <p className="login-subtitle">Coloca tus datos para {mode === 'login' ? 'iniciar sesión' : 'crear cuenta'}</p>

        <form onSubmit={submit} className="login-form">
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
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          {mode === 'login' && (
            <Link href="#" className="forgot-password">
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
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="register-text"
          >
            {mode === 'login' ? ' Regístrate' : ' Inicia sesión'}
          </Link>
        </p>

        {/* Íconos Sociales (abajo como en la foto) */}
        <div className="social-login">
          <button className="social-button facebook" aria-label="Facebook">
            <Facebook size={20} />
          </button>
          <button className="social-button instagram" aria-label="Instagram">
            <Instagram size={20} />
          </button>
          <button className="social-button twitter" aria-label="Twitter">
            <Twitter size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}