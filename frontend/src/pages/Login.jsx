import { useState } from 'react';
import { api } from '../services/api';

export default function Login(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [mode,setMode] = useState('login'); // 'login' | 'register'
  const [error,setError] = useState(null);

  async function submit(e){
    e.preventDefault();
    try{
      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      await api.post(url, { email, password });
      window.location.href = '/'; // o usa navigate('/')
    }catch(err){ setError(err.response?.data?.error || 'Error'); }
  }

  function linkSpotify(){
    window.location.href = 'http://localhost:4000/auth/spotify/start';
  }

  return (
    <div className="login">
      <h1>{mode==='login'?'Iniciar sesión':'Crear cuenta'}</h1>
      <form onSubmit={submit}>
        <input type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required/>
        {error && <p style={{color:'tomato'}}>{error}</p>}
        <button type="submit">{mode==='login'?'Entrar':'Registrarme'}</button>
      </form>

      <div style={{marginTop:12}}>
        <button onClick={linkSpotify}>Vincular o entrar con Spotify</button>
      </div>

      <p style={{marginTop:8}}>
        {mode==='login'?'¿No tienes cuenta?':''}
        <a href="#" onClick={()=>setMode(mode==='login'?'register':'login')}>
          {mode==='login'?' Regístrate':' ¿Ya tienes cuenta? Inicia sesión'}
        </a>
      </p>
    </div>
  );
}
