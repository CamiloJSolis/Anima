import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

// --- Mocks ---
// Mockea el hook de autenticación
vi.mock('./services/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

// Mockea las páginas para que los tests sean rápidos
vi.mock('./pages/Home.jsx', () => ({ default: () => <div>Página de Inicio</div> }));
vi.mock('./pages/Login.jsx', () => ({ default: () => <div>Página de Login</div> }));
vi.mock('./pages/Profile.jsx', () => ({ default: () => <div>Página de Perfil</div> }));
vi.mock('./pages/Historial.jsx', () => ({ default: () => <div>Página de Historial</div> }));

// Importa los mocks después de definirlos
import { useAuth } from './services/auth.jsx';

beforeEach(() => {
  vi.restoreAllMocks();
});

// Función de renderizado especial
const renderAppOnRoute = (route) => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
};

// --- Tests ---
describe('Test de Rutas Protegidas', () => {
  
  // --- ¡ESTE ES EL TEST QUE TÚ QUERÍAS! ---
  test('redirige a Login si un usuario NO logueado intenta ver /profile', () => {
    // ARRANGE: Finge que el usuario NO está logueado
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false, 
    });

    // ACT: Intenta navegar a "/profile" (simula pegar el link)
    renderAppOnRoute('/profile');

    // ASSERT: Verifica que terminó en la "Página de Login"
    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Página de Perfil')).not.toBeInTheDocument();
  });

  test('muestra la página /profile si el usuario SÍ está logueado', () => {
    // ARRANGE: Finge que SÍ está logueado
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { username: 'tester' },
    });

    // ACT: Navega a "/profile"
    renderAppOnRoute('/profile');

    // ASSERT: Verifica que SÍ se muestra la "Página de Perfil"
    expect(screen.getByText('Página de Perfil')).toBeInTheDocument();
    expect(screen.queryByText('Página de Login')).not.toBeInTheDocument();
  });
});