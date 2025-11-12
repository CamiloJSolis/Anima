// /backend/src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import analyzeRoutes from './routes/analyze.routes.js';
import recommendationsRoutes from './routes/recommendations.routes.js';
import spotifyRoutes from './routes/spotify.routes.js';
import historyRoutes from './routes/history.routes.js'; // mantiene historial real

const app = express();

// Origen del frontend (Vite)
const FRONTEND_ORIGIN = 'http://127.0.0.1:5173';

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rutas principales de tu API
app.use('/auth', authRoutes);
app.use('/analyze', analyzeRoutes);
app.use('/recommendations', recommendationsRoutes);

// Rutas de Spotify (OAuth + top-tracks)
app.use('/auth/spotify', spotifyRoutes);

// Historial real
app.use('/history', historyRoutes);

// Healthchecks
app.get('/__health', (req, res) =>
  res.status(200).json({ ok: true, env: process.env.NODE_ENV || 'dev' })
);
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Manejador de errores genérico
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Levantar server solo fuera de tests y exportar app para pruebas
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend escuchando en http://127.0.0.1:${PORT}`);
  });
}

export default app;
