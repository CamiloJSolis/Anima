import React from 'react';
// 1. Importa 'fireEvent' para simular clics
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

// --- Mocks (Igual que antes) ---
vi.mock('../services/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../services/auth.jsx';

const mockLogout = vi.fn();

// Limpieza
beforeEach(() => {
  vi.restoreAllMocks();
  // Resetea el mock de auth por defecto a "no logueado"
  useAuth.mockReturnValue({
    isAuthenticated: false,
    user: null,
    logout: mockLogout,
  });
});

const renderSidebar = () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );
};

// --- Tests Actualizados ---

describe('Componente Sidebar', () => {

  test('debe renderizar enlaces de "no logueado"', () => {
    // ARRANGE: (Ya está en 'beforeEach')
    // ACT
    renderSidebar();

    // ASSERT
    // Revisa que SÍ esté el enlace de "Iniciar Sesión" (el ícono de persona)
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    // Revisa que NO esté el botón de "Menú de perfil"
    expect(screen.queryByRole('button', { name: 'Menú de perfil' })).not.toBeInTheDocument();
  });

  // --- PRUEBA ACTUALIZADA ---
  test('debe mostrar el botón de menú cuando está logueado (menú cerrado)', () => {
    // ARRANGE: Finge que SÍ está logueado
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'tester', email: 'test@anima.com' },
      logout: mockLogout,
    });

    // ACT
    renderSidebar();

    // ASSERT
    // Revisa que SÍ esté el botón para abrir el menú
    expect(screen.getByRole('button', { name: 'Menú de perfil' })).toBeInTheDocument();
    
    // Revisa que el link de "Iniciar Sesión" NO esté
    expect(screen.queryByRole('link', { name: 'Iniciar Sesión' })).not.toBeInTheDocument();
    
    // IMPORTANTE: Revisa que las opciones del menú estén OCULTAS
    expect(screen.queryByText('Ver Perfil')).not.toBeInTheDocument();
    expect(screen.queryByText('Cerrar Sesión')).not.toBeInTheDocument();
  });

  // --- PRUEBA NUEVA ---
  test('debe mostrar las opciones del menú al hacer clic en el botón', async () => {
    // ARRANGE: Finge que SÍ está logueado
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'tester', email: 'test@anima.com' },
      logout: mockLogout,
    });
    renderSidebar();

    // ACT: Simula el clic del usuario en el botón del menú
    fireEvent.click(screen.getByRole('button', { name: 'Menú de perfil' }));

    // ASSERT: Espera y revisa que el contenido del menú AHORA SÍ sea visible
    expect(await screen.findByText('Ver Perfil')).toBeInTheDocument();
    expect(await screen.findByText('Cerrar Sesión')).toBeInTheDocument();
    expect(await screen.findByText('tester')).toBeInTheDocument(); // Revisa que salga el nombre
  });

});