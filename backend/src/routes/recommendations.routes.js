import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getRecommendationsForEmotion, persistRecommendationSession } from '../services/recommendations.service.js';
import { pool } from '../db/pool.js';

const router = Router();

function getUserIdFromCookie(req) {
  const t = req.cookies?.token;
  if (!t) return null;
  try {
    const p = jwt.verify(t, process.env.JWT_SECRET);
    return p.user_id;
  } catch { return null; }
}

/**
 * POST /recommendations
 * body: { emotion: 'feliz', confidence: 0.91 }
 * Invitado: userId = null (no persiste memoria); Logueado: guarda sesión + memoria
 */
router.post('/', async (req, res, next) => {
  try {
    const { emotion, confidence } = req.body || {};
    if (!emotion) return res.status(400).json({ error: 'emotion requerida' });

    const userId = getUserIdFromCookie(req);

    const { tracks, seeds } = await getRecommendationsForEmotion({
      userId,
      emotion,
      count: 20,
      market: process.env.SPOTIFY_MARKET || 'MX'
    });

    // Guardar sesión (si userId → también memoria)
    await persistRecommendationSession({
      userId,
      emotion,
      confidence: confidence ?? null,
      tracks,
      seeds
    });

    res.json({ tracks });
  } catch (e) { next(e); }
});

/**
 * GET /recommendations/history?page=&limit=
 * (Solo logueados)
 */
router.get('/history', async (req, res, next) => {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) return res.status(401).json({ error: 'No auth' });

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 50);
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT id, emotion, confidence, tracks, created_at
       FROM recommendation_sessions
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

/**
 * GET /recommendations/weekly-summary
 * Dominante de la semana + ejemplo de top items
 */
router.get('/weekly-summary', async (req, res, next) => {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) return res.status(401).json({ error: 'No auth' });

    const { rows } = await pool.query(
      `WITH last7 AS (
         SELECT emotion, tracks, created_at
         FROM recommendation_sessions
         WHERE user_id=$1 AND created_at >= NOW() - INTERVAL '7 days'
       )
       SELECT emotion, COUNT(*) as cnt
       FROM last7
       GROUP BY emotion
       ORDER BY cnt DESC
       LIMIT 1`,
      [userId]
    );

    const dominant = rows[0] || null;
    res.json({ dominant_emotion: dominant?.emotion || null, count: dominant?.cnt || 0 });
  } catch (e) { next(e); }
});

export default router;