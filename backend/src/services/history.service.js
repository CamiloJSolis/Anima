// /backend/src/services/history.service.js
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { getClientCredentialsToken, spotifyGet } from './spotify.service.js';

// --- helpers BD ---
async function getEmotionId(emotion) {
  const q = await pool.query('SELECT emotion_id FROM emotions WHERE emotion = $1', [emotion]);
  if (!q.rowCount) throw new Error(`Emotion "${emotion}" no existe en tabla emotions`);
  return q.rows[0].emotion_id;
}

export async function recordAnalysis({ userId, emotion, confidence, trackIds }) {
  // Si no hay usuario logueado, no guardamos historial (evita error por FK)
  if (!userId) return;

  const emotionId = await getEmotionId(emotion);
  await pool.query(
    `INSERT INTO analysis_history(user_id, emotion_id, confidence, track_ids)
     VALUES($1,$2,$3,$4)`,
    [userId, emotionId, confidence, trackIds]
  );
}

// Devuelve últimos N análisis del usuario con metadatos de Spotify
export async function fetchHistory(userId, limit = 10) {
  const q = await pool.query(
    `SELECT ah.analysis_id, ah.user_id, ah.confidence, ah.track_ids, ah.analyzed_at, e.emotion
       FROM analysis_history ah
       JOIN emotions e ON e.emotion_id = ah.emotion_id
      WHERE ah.user_id = $1
      ORDER BY ah.analyzed_at DESC
      LIMIT $2`,
    [userId, limit]
  );

  // Token app (client credentials) para pedir detalles de canciones
  const { access_token } = await getClientCredentialsToken();

  // Mapear cada fila: por cada grupo de tracks pedimos /tracks
  const items = [];
  for (const row of q.rows) {
    const ids = row.track_ids || [];
    if (!ids.length) {
      items.push({ ...row, tracks: [] });
      continue;
    }

    // Spotify permite hasta 50 por llamada
    const idsParam = ids.slice(0, 50).join(',');
    const data = await spotifyGet(`/tracks`, access_token, { ids: idsParam });

    const tracks = (data.tracks || []).map(t => ({
      id: t.id,
      name: t.name,
      artists: (t.artists || []).map(a => a.name).join(', '),
      image: t.album?.images?.[0]?.url ?? null,
      url: t.external_urls?.spotify ?? null,
    }));

    items.push({
      analysis_id: row.analysis_id,
      emotion: row.emotion,
      confidence: Number(row.confidence),
      analyzed_at: row.analyzed_at,
      tracks,
    });
  }

  return items;
}

// Lee userId del JWT cookie "token" (o devuelve null)
export function getUserIdFromReq(req) {
  try {
    const t = req.cookies?.token;
    if (!t) return null;
    const payload = jwt.verify(t, process.env.JWT_SECRET);
    return payload.user_id || null;
  } catch {
    return null;
  }
}
