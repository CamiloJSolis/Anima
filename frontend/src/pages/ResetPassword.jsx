import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
// No CSS import needed—Tailwind handles everything inline

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Estados para feedback
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmError, setConfirmError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidParams, setInvalidParams] = useState(false);

  // Regex para contraseña igual que en Login
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Función para validar contraseña
  const validatePassword = (pwd) => {
    setPasswordErrors([]);
    let strength = '';
    let errors = [];

    if (pwd.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/(?=.*[a-z])/.test(pwd)) errors.push('Al menos 1 minúscula (a-z)');
    if (!/(?=.*[A-Z])/.test(pwd)) errors.push('Al menos 1 mayúscula (A-Z)');
    if (!/(?=.*\d)/.test(pwd)) errors.push('Al menos 1 número (0-9)');
    if (!/(?=.*[@$!%*?&])/.test(pwd)) errors.push('Al menos 1 símbolo (@$!%*?&)');

    const totalReq = 5;
    const metReq = (pwd.length >= 8 ? 1 : 0) + (/(?=.*[a-z])/.test(pwd) ? 1 : 0) + (/(?=.*[A-Z])/.test(pwd) ? 1 : 0) + (/(?=.*\d)/.test(pwd) ? 1 : 0) + (/(?=.*[@$!%*?&])/.test(pwd) ? 1 : 0);
    
    if (metReq === totalReq) strength = 'strong';
    else if (metReq >= 3) strength = 'medium';
    else if (metReq > 0) strength = 'weak';

    setPasswordStrength(strength);
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Handlers con validación
  const handleNewPasswordChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    validatePassword(pwd);
    if (confirmPassword) setConfirmError(pwd !== confirmPassword ? 'Las contraseñas no coinciden' : '');
  };

  const handleConfirmChange = (e) => {
    const confirm = e.target.value;
    setConfirmPassword(confirm);
    setConfirmError(newPassword !== confirm ? 'Las contraseñas no coinciden' : '');
  };

  // Carga params de URL
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlToken = searchParams.get('token');
    if (urlEmail && urlToken) {
      setEmail(urlEmail);
      setToken(urlToken);
    } else {
      setInvalidParams(true);
      setSubmitError('Enlace inválido. Solicita un nuevo email de recuperación.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setLoading(true);

    if (!validatePassword(newPassword)) {
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', { email, token, newPassword });
      setSubmitSuccess(true);
      // Limpia form y redirige en 3s
      setTimeout(() => navigate('/login?mode=login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al resetear la contraseña. Intenta de nuevo.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Si params inválidos, muestra error simple
  if (invalidParams) {
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
            onClick={() => navigate('/login')}
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
            Error
          </h1>
          <p className="
            text-base text-(--text-gray) mb-8
            /* Mobile: Smaller */
            max-md:text-sm
          ">
            {submitError}
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="
              bg-linear-to-r from-(--accent-violet) to-(--accent-blue)
              text-white border-none rounded-md py-3.5 text-base font-medium cursor-pointer
              transition-all duration-200 w-full hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(138,43,226,0.3)]
              shadow-[0_4px_12px_rgba(138,43,226,0.3)]
            "
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate('/login')}
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
          Nueva contraseña
        </h1>
        <p className="
          text-base text-(--text-gray) mb-8
          /* Mobile: Smaller */
          max-md:text-sm
        ">
          Crea una contraseña segura para tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-gray) z-10 pointer-events-none" size={20} />
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={handleNewPasswordChange}
              className={`
                w-full pl-10 pr-10 h-12 py-3 leading-relaxed bg-[rgba(255,255,255,0.1)]
                border rounded-md text-(--text-primary) text-base transition-colors
                focus:outline-none placeholder:text-(--text-gray)
                ${passwordErrors.length > 0 ? 'border-(--accent-red)' : passwordStrength === 'strong' ? 'border-green-500' : 'border-[rgba(156,163,175,0.3)] focus:border-(--accent-violet)'}
              `}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-(--text-gray) cursor-pointer p-0"
              aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Indicador de fuerza */}
          {newPassword && (
            <div className="text-left text-xs space-y-1">
              <p className={`font-medium ${getStrengthColor(passwordStrength)}`}>
                Fuerza: {passwordStrength ? (passwordStrength === 'strong' ? 'Fuerte' : passwordStrength === 'medium' ? 'Media' : 'Débil') : 'Ninguna'}
              </p>
              {passwordErrors.length > 0 && (
                <ul className="text-(--accent-red) space-y-0.5 list-disc list-inside">
                  {passwordErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
              {passwordStrength === 'strong' && (
                <p className="text-green-500">¡Excelente! Cumple todos los requisitos.</p>
              )}
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-gray) z-10 pointer-events-none" size={20} />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={handleConfirmChange}
              className={`
                w-full pl-10 pr-10 h-12 py-3 leading-relaxed bg-[rgba(255,255,255,0.1)]
                border rounded-md text-(--text-primary) text-base transition-colors
                focus:outline-none placeholder:text-(--text-gray)
                ${confirmError ? 'border-(--accent-red)' : 'border-[rgba(156,163,175,0.3)] focus:border-(--accent-violet)'}
              `}
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
            <p className="text-(--accent-red) text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {confirmError}
            </p>
          )}

          {submitError && (
            <p className="text-(--accent-red) text-sm m-0 text-left flex items-center gap-1">
              <AlertCircle size={16} /> {submitError}
            </p>
          )}

          {submitSuccess && (
            <p className="text-green-500 text-sm m-0 text-left flex items-center gap-1">
                ¡Contraseña actualizada! Redirigiendo al login...
            </p>
          )}

          <button
            type="submit"
            disabled={loading || passwordErrors.length > 0 || !!confirmError || submitSuccess}
            className={`
              border-none rounded-md py-3.5 text-base font-medium cursor-pointer transition-all duration-200 w-full
              ${loading || passwordErrors.length > 0 || !!confirmError || submitSuccess
                ? 'bg-(--text-gray) cursor-not-allowed opacity-60'
                : 'bg-linear-to-r from-(--accent-violet) to-(--accent-blue) text-white hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(138,43,226,0.4)] shadow-[0_4px_12px_rgba(138,43,226,0.3)]'
              }`}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
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