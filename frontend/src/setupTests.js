import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'; // Importa 'expect' extendido

// Esto limpia el 'jsdom' (el DOM simulado) después de CADA prueba
// para que los tests no interfieran entre sí.
afterEach(() => {
  cleanup();
});