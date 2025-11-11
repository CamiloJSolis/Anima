import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

vi.mock('../services/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../services/auth.jsx';

const renderSidebar = () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );
};

describe('Componente Sidebar', () => {

  test('debe renderizar logo y enlaces de "no logueado"', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      logout: vi.fn(), 
    });

    renderSidebar();

    expect(screen.getByAltText('Anima Logo')).toBeInTheDocument();
    
    expect(screen.getByRole('link', { name: "Home" })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: "Analizar" })).toHaveAttribute('href', '/analizar');
    
    expect(screen.getByRole('link', { name: "Iniciar Sesión" })).toHaveAttribute('href', '/login');

    expect(screen.queryByRole('link', { name: "Perfil" })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "Cerrar Sesión" })).not.toBeInTheDocument();
  });

  test('debe renderizar enlaces de "logueado"', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(), 
    });

    renderSidebar();

    expect(screen.getByAltText('Anima Logo')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: "Perfil" })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('button', { name: "Cerrar Sesión" })).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: "Iniciar Sesión" })).not.toBeInTheDocument();
  });
});