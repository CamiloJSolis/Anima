import React, { useState } from 'react';
import { Mail, ArrowLeft, MailCheck, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // Éxito o error
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validación básica de email en tiempo real
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!emailRegex.test(newEmail) ? 'Email inválido' : '');
    if (message) setMessage(''); // Limpia mensaje previo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setEmailError(''); // Limpia error previo

    if (emailError || !email) {
      setMessage('Ingresa un email válido');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('¡Email enviado! Revisa tu bandeja de entrada (y spam).');
      setEmail(''); // Limpia el form
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al enviar el email. Intenta de nuevo.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen bg-(--bg-primary) text-(--text-primary) font-(--font-family)
      flex items-center justify-center p-5
    ">
      <div className="
        bg-linear-to-br from-[rgba(138,43,226,0.4)] to-[rgba(0,191,255,0.3)]
        backdrop-blur-[10px] rounded-2xl p-10 w-full max-w-md text-center
        shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(156,163,175,0.2)]
        /* Mobile: Tighter padding */
        max-md:p-8 max-md:m-2.5
      ">
        <button
          onClick={() => navigate('/login?mode=login')}
          className="
            absolute left-4 top-4 text-(--text-gray) hover:text-(--accent-violet)
            transition-colors
          "
        >
          <ArrowLeft size={20} />
        </button>
        
        <h1 className="
          text-2xl font-semibold text-(--text-primary) mb-2
          /* Mobile: Smaller */
          max-md:text-xl
        ">
          Recuperar contraseña
        </h1>
        <p className="
          text-base text-(--text-gray) mb-8
          /* Mobile: Smaller */
          max-md:text-sm
        ">
          Ingresa tu email y te enviaremos un enlace para resetearla.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-gray) z-10 pointer-events-none" size={20} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={handleEmailChange}
              className={`
                w-full pl-10 pr-3 h-12 py-3 leading-relaxed bg-[rgba(255,255,255,0.1)]
                border rounded-md text-(--text-primary) text-base transition-colors
                focus:outline-none placeholder:text-(--text-gray)
                ${emailError ? 'border-(--accent-red)' : 'border-[rgba(156,163,175,0.3)] focus:border-(--accent-violet)'}
              `}
              required
            />
          </div>
          {emailError && (
            <p className="text-(--accent-red) text-xs mt-1 flex items-center gap-1 justify-start">
              <CircleAlert size={12} /> {emailError}
            </p>
          )}

          {message && (
            <p className={`text-sm m-0 text-left flex items-center gap-1 justify-center ${
              message.includes('enviado') ? 'text-green-500' : 'text-(--accent-red)'
            }`}>
              {message.includes('enviado') ? <MailCheck size={12} /> : <CircleAlert size={12} />} {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !!emailError}
            className={`
              border-none rounded-md py-3.5 text-base font-medium cursor-pointer transition-all duration-200 w-full
              ${loading || !email || !!emailError
                ? 'bg-(--text-gray) cursor-not-allowed opacity-60'
                : 'bg-linear-to-r from-(--accent-violet) to-(--accent-blue) text-white hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(138,43,226,0.4)] shadow-[0_4px_12px_rgba(138,43,226,0.3)]'
              }`}
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <p className="
          text-sm text-(--text-gray) mt-6 m-0
          /* Mobile: Smaller */
          max-md:text-xs
        ">
          ¿Cambiaste de idea? <button 
            onClick={() => navigate('/login?mode=login')} 
            className="
              text-(--accent-violet) font-medium ml-1
              hover:text-(--accent-blue) transition-colors underline decoration-1 underline-offset-2
            "
          >
            Volver al login
          </button>
        </p>
      </div>
    </div>
  );
}