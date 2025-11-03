import { pool } from '../db/pool.js';
import { getClientCredentialsToken, spotifyGet } from './spotify.service.js';

const EMOTION_SEEDS = {
  HAPPY:   { seed_genres: ['pop','dance','happy'] },
  SAD:  { seed_genres: ['sad','acoustic','piano'] },
  ANGRY: { seed_genres: ['metal','rock','hard-rock'] },
  SURPRISE:{ seed_genres: ['edm','electronic','indie'] },
  FEAR:   { seed_genres: ['ambient','chill','classical'] },
  DISGUST:{ seed_genres:['punk','grunge','alt-rock'] },
  CALM: { seed_genres: ['lo-fi','chill','indie-pop'] }
};

function normalizeEmotion(e) {
  return (e || '').toLowerCase();
}

export async function getRecommendationsForEmotion({ userId=null, emotion, count=20, market=process.env.SPOTIFY_MARKET || 'MX' }) {
  const emo = normalizeEmotion(emotion);
  const seeds = EMOTION_SEEDS[emo] || EMOTION_SEEDS['neutral'];

  // token app-level (invitado o incluso logueado si no quieres tocar su cuenta)
  const { access_token } = await getClientCredentialsToken();

  // random offset para rotación (Spotify limita a 1000 en muchas búsquedas)
  const offset = Math.floor(Math.random() * 200);

  // 1) Tracks usando Recommendations endpoint
  // Simple: usa seed_genres; también podrías mezclar seed_artists/seed_tracks
  const params = {
    seed_genres: seeds.seed_genres.slice(0,5).join(','),
    limit: count,
    market
  };
  const rec = await spotifyGet('/recommendations', access_token, params);
  let tracks = (rec.tracks || []).map(t => t.id);

  // 2) Filtra contra memoria reciente del usuario (si hay userId)
  if (userId && tracks.length) {
    const { rows } = await pool.query(
      `SELECT item_id FROM user_item_memory
       WHERE user_id=$1 AND emotion=$2 AND item_type='track'
       ORDER BY created_at DESC LIMIT 200`,
      [userId, emo]
    );
    const seen = new Set(rows.map(r => r.item_id));
    tracks = tracks.filter(id => !seen.has(id));
    // si se vacía, permite algunas repetidas:
    if (tracks.length < 5) {
      tracks = (rec.tracks || []).map(t => t.id).slice(0, count);
    }
  }

  // 3) Playlists por emoción usando búsqueda
  // Nota: Spotify no tiene "playlist recommendations" directas; hacemos una search por término
  const q = `${emo} mood`;
  const search = await spotifyGet('/search', access_token, {
    q, type: 'playlist', market, limit: 10, offset
  });
  let playlists = (search.playlists?.items || []).map(p => p.id);

  if (userId && playlists.length) {
    const { rows } = await pool.query(
      `SELECT item_id FROM user_item_memory
       WHERE user_id=$1 AND emotion=$2 AND item_type='playlist'
       ORDER BY created_at DESC LIMIT 100`,
      [userId, emo]
    );
    const seen = new Set(rows.map(r => r.item_id));
    playlists = playlists.filter(id => !seen.has(id));
    if (playlists.length < 3) {
      playlists = (search.playlists?.items || []).map(p => p.id);
    }
  }

  return { tracks, playlists, seeds };
}

export async function persistRecommendationSession({ userId=null, emotion, confidence=null, tracks, playlists, seeds }) {
  // Guarda sesión
  await pool.query(
    `INSERT INTO recommendation_sessions(user_id, emotion, confidence, tracks, playlists, seed)
     VALUES($1,$2,$3,$4,$5,$6)`,
    [userId, emotion, confidence, tracks, playlists, seeds]
  );

  // Actualiza memoria (solo si userId)
  if (userId) {
    const trackValues = tracks.map(id => `(${userId}, '${emotion}', 'track', '${id}')`).join(',');
    const plistValues = playlists.map(id => `(${userId}, '${emotion}', 'playlist', '${id}')`).join(',');
    const sqls = [];
    if (tracks.length) sqls.push(`INSERT INTO user_item_memory(user_id,emotion,item_type,item_id) VALUES ${trackValues}`);
    if (playlists.length) sqls.push(`INSERT INTO user_item_memory(user_id,emotion,item_type,item_id) VALUES ${plistValues}`);
    if (sqls.length) {
      for (const s of sqls) await pool.query(s);
    }
  }
}
