// /backend/src/routes/history.routes.js
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { getClientCredentialsToken, spotifyGet } from '../services/spotify.service.js';

const router = Router();
const MARKET = process.env.SPOTIFY_MARKET || 'US';

/** Autenticación por cookie JWT */
function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'No autenticado' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.user_id;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'No autenticado' });
  }
}

/** Normaliza items de la playlist de Spotify a {id,name,artists,image,url} */
function mapTrackItem(item) {
  const t = item?.track;
  if (!t) return null;
  const artists = (t.artists || []).map(a => a.name).join(', ');
  const image =
    t.album?.images?.[0]?.url ||
    t.album?.images?.[1]?.url ||
    t.album?.images?.[2]?.url ||
    ''; // si no hay, dejamos vacío (el front ya pone fallback)
  return {
    id: t.id,
    name: t.name,
    artists,
    image,
    url: t.external_urls?.spotify || ''
  };
}

/**
 * GET /history
 * Devuelve el historial REAL del usuario autenticado:
 * - Lee tus tablas (analysis_history + emotions)
 * - Con el playlist_id, pide a Spotify sus tracks (client_credentials)
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 20);

    // 1) Últimos análisis del usuario
    const { rows } = await pool.query(
      `SELECT
         ah.analysis_id       AS id,
         ah.analyzed_at,
         ah.confidence,
         ah.playlist_id,
         ah.playlist_url,
         e.emotion
       FROM analysis_history ah
       JOIN emotions e ON e.emotion_id = ah.emotion_id
       WHERE ah.user_id = $1
       ORDER BY ah.analyzed_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    // Si no hay análisis, responde vacío
    if (rows.length === 0) {
      return res.json({ sessions: [] });
    }

    // 2) Token app-to-Spotify (NO depende del usuario)
    const tokenData = await getClientCredentialsToken();
    const accessToken = tokenData.access_token;

    // 3) Para cada análisis, trae la playlist actual de Spotify
    const sessions = [];
    for (const r of rows) {
      let tracks = [];
      try {
        if (r.playlist_id) {
          const playlist = await spotifyGet(`/playlists/${r.playlist_id}`, accessToken, { market: MARKET });
          const items = playlist?.tracks?.items || [];
          tracks = items
            .map(mapTrackItem)
            .filter(Boolean)
            // si quieres limitar cuántas mostramos
            .slice(0, 10);
        }
      } catch (e) {
        // si falla Spotify para una, no rompemos toda la respuesta
        tracks = [];
      }

      sessions.push({
        id: r.id,
        emotion: r.emotion,
        confidence: Number(r.confidence),
        analyzed_at: r.analyzed_at,
        playlist: r.playlist_id
          ? { id: r.playlist_id, url: r.playlist_url }
          : null,
        tracks
      });
    }

    res.json({ sessions });
  } catch (e) {
    next(e);
  }
});

export default router;
