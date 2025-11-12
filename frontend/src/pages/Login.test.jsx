import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// --- 1. MOCK DE DEPENDENCIAS EXTERNAS ---

// Mockear el hook de autenticación
vi.mock('../services/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

// Mockear la API (ahora solo creamos las funciones vacías)
vi.mock('../services/api.js', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Mockear useNavigate
const mockNavigate = vi.fn(); // Esta variable SÍ se puede usar aquí
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Mantiene <MemoryRouter>, <Link> etc.
    useNavigate: () => mockNavigate, // Solo sobrescribe useNavigate
  };
});

// --- 2. IMPORTAR LOS MOCKS (y el componente) ---
// Ahora importamos los mocks Y el componente a probar
import { useAuth } from '../services/auth.jsx';
import { api } from '../services/api.js';
import Login from './Login.jsx';

// --- 3. SETUP & CLEANUP ---
const mockLogin = vi.fn(); // Variable local para verificar que se llame

beforeEach(() => {
  // Limpia los mocks antes de cada test
  vi.clearAllMocks();
  
  // Define el valor de retorno por DEFECTO para useAuth
  useAuth.mockReturnValue({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
  });
});

const renderLogin = (initialRoute = '/login') => {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Login />
    </MemoryRouter>
  );
};

// --- 4. TESTS (Casi idénticos) ---

describe('Página de Login y Registro', () => {

  test('debe renderizar el formulario de inicio de sesión por defecto', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
  });

  test('debe llamar a la API, llamar a login() y redirigir a /profile en login exitoso', async () => {
    // ARRANGE: Ahora le decimos a la 'api' importada qué devolver
    const mockUserData = { username: 'testuser', email: 'a@a.com' };
    api.post.mockResolvedValue({ 
      data: { user: mockUserData } 
    });

    renderLogin();

    // ACT
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@anima.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // ASSERT
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@anima.com',
        password: 'Password123!',
      });
      expect(mockLogin).toHaveBeenCalledWith(mockUserData);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('debe llamar a la API, llamar a login() y redirigir a / en registro exitoso', async () => {
    // ARRANGE
    api.post.mockResolvedValue({ 
      data: { user: { username: 'newuser' } } 
    });
    
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /regístrate/i })); 

    // ACT
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'new@anima.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    // ASSERT
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.anything());
      expect(mockNavigate).toHaveBeenCalledWith('/'); 
    });
  });

  test('debe mostrar error al ingresar una contraseña débil en modo registro', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /regístrate/i }));

    // ACT
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123' } });

    // ASSERT
    expect(screen.getByText('Fuerza: Débil')).toBeInTheDocument();
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarme/i })).toBeDisabled();
  });

  test('debe mostrar error global si la API falla', async () => {
    // ARRANGE
    const mockError = { response: { data: { error: 'Contraseña inválida' } } };
    api.post.mockRejectedValue(mockError);

    renderLogin();

    // ACT
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText(/Contraseña inválida/i)).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});