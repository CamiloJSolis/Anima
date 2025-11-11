import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Historial from './Historial.jsx';

// --- Mocks ---
vi.mock('../services/auth.jsx');
vi.mock('../services/api');

import { useAuth } from '../services/auth.jsx';
import { api } from '../services/api';

const mockedUseAuth = vi.mocked(useAuth);
const mockedApiGet = vi.mocked(api.get);


beforeEach(() => {
  
  mockedUseAuth.mockReset();
  mockedApiGet.mockReset();
});

afterEach(() => {
  cleanup();
});



const renderHistorial = () => {
  render(
    <MemoryRouter>
      <Historial />
    </MemoryRouter>
  );
};

describe('Página de Historial (con AuthProvider)', () => {

  test('debe mostrar "Cargando..." si el AuthProvider está cargando', () => { 
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true, 
    });

    
    renderHistorial();

    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument(); 
    expect(mockedApiGet).not.toHaveBeenCalled();
  });
  
  test('debe mostrar el mensaje para Iniciar Sesión si no hay usuario', async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false, 
    });

    // ACT
    renderHistorial();
    
    // ASSERT
    expect(await screen.findByText('Inicia sesión para ver tu historial')).toBeInTheDocument();
    expect(mockedApiGet).not.toHaveBeenCalled();
  });
  
  test('debe mostrar el historial si el usuario está logueado', async () => {
    mockedUseAuth.mockReturnValue({
      user: { name: 'Tester', email: 'test@test.com', username: 'tester' },
      isAuthenticated: true,
      isLoading: false, 
    });
    mockedApiGet.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/weekly-summary')) {
        return Promise.resolve({ data: { dominant_emotion: 'Felicidad', count: 5 } });
      }
      return Promise.reject(new Error('URL no mockeada'));
    });

    // ACT
    renderHistorial();

    // ASSERT
    expect(await screen.findByText('¡Hola, tester!')).toBeInTheDocument();
    expect(await screen.findByText(/Emoción dominante esta semana:/)).toBeInTheDocument();
    expect(await screen.findByText('Felicidad')).toBeInTheDocument();
    expect(await screen.findByText('No hay historial aún. ¡Ve a Analizar y genera recomendaciones!')).toBeInTheDocument();
  });

});
