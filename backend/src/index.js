// /backend/src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import analyzeRoutes from './routes/analyze.routes.js';
import recommendationsRoutes from './routes/recommendations.routes.js';
import spotifyRoutes from './routes/spotify.routes.js';
import historyRoutes from './routes/history.routes.js'; // <-- NUEVO

const app = express();

const FRONTEND_ORIGIN = 'http://127.0.0.1:5173';

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/analyze', analyzeRoutes);
app.use('/recommendations', recommendationsRoutes);
app.use('/auth/spotify', spotifyRoutes);

// monta el historial real:
app.use('/history', historyRoutes); // <-- NUEVO

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://127.0.0.1:${PORT}`);
});
