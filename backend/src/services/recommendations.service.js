// ...existing code...
import { pool } from "../db/pool.js";
import { getClientCredentialsToken, spotifyGet } from "./spotify.service.js";

const EMOTION_SEEDS = {
  HAPPY: { seed_genres: ["pop", "dance", "happy"] },
  SAD: { seed_genres: ["sad", "acoustic", "piano"] },
  ANGRY: { seed_genres: ["metal", "rock", "hard-rock"] },
  SURPRISE: { seed_genres: ["edm", "electronic", "indie"] },
  FEAR: { seed_genres: ["ambient", "chill", "classical"] },
  DISGUST: { seed_genres: ["punk", "grunge", "alt-rock"] },
  CALM: { seed_genres: ["lo-fi", "chill", "indie-pop"] },
};

function normalizeEmotion(e) {
  return (e || "").toUpperCase();
}

export async function getRecommendationsForEmotion({
  userId = null,
  emotion,
  count = 20,
  market = process.env.SPOTIFY_MARKET || "MX",
}) {
  const emoKey = normalizeEmotion(emotion);
  const seeds = EMOTION_SEEDS[emoKey] || EMOTION_SEEDS.CALM;

  const tokenResp = await getClientCredentialsToken();
  const access_token = tokenResp?.access_token;
  if (!access_token) {
    throw new Error("[recommendations] no access_token from spotify (client credentials)");
  }

  const offset = Math.floor(Math.random() * 1000);

  let tracks = [];

  try {
    const q = `${(emotion || "").trim()} ${seeds.seed_genres.join(" ")}`.trim();
    const search = await spotifyGet("/search", access_token, {
      q,
      type: "track",
      market,
      limit: count,
      offset,
    });
    const items = search?.tracks?.items || [];
    tracks = items.map((t) => ({
      id: t.id,
      name: t.name,
      artists: (t.artists || []).map((a) => a.name),
      preview_url: t.preview_url,
      uri: t.uri,
      external_url: t.external_urls?.spotify,
      album: {
        id: t.album?.id,
        name: t.album?.name,
        images: t.album?.images || [],
      },
    }));
  } catch (err) {
    console.error("[recommendations] search failed", err?.message || err);
  }

  // filtrar por memoria del usuario para tracks solamente
  if (userId && tracks.length) {
    try {
      const { rows } = await pool.query(
        `SELECT item_id FROM user_item_memory
         WHERE user_id=$1 AND emotion=$2 AND item_type='track'
         ORDER BY created_at DESC LIMIT 200`,
        [userId, emoKey]
      );
      const seen = new Set(rows.map((r) => r.item_id));
      tracks = tracks.filter((t) => !seen.has(t.id));
    } catch (err) {
      console.error("[recommendations] user memory filter failed", err?.message || err);
    }
  }

  return { tracks: tracks.slice(0, count), seeds };
}

export async function persistRecommendationSession({
  userId = null,
  emotion,
  confidence = null,
  tracks,
  seeds,
}) {
  const trackIds = Array.isArray(tracks)
    ? tracks.map((t) => (typeof t === "string" ? t : t.id)).filter(Boolean)
    : [];

  await pool.query(
    `INSERT INTO recommendation_sessions(user_id, emotion, confidence, tracks, seed)
     VALUES($1,$2,$3,$4,$5)`,
    [userId, emotion, confidence, trackIds, seeds]
  );

  if (userId && trackIds.length) {
    const inserts = [];
    const params = [];
    let idx = 1;

    for (const id of trackIds) {
      params.push(userId, emotion, "track", id);
      inserts.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    }

    if (inserts.length) {
      const sql = `INSERT INTO user_item_memory(user_id, emotion, item_type, item_id) VALUES ${inserts.join(
        ","
      )}`;
      try {
        await pool.query(sql, params);
      } catch (err) {
        console.error("[recommendations] persist user_item_memory failed", err?.message || err);
      }
    }
  }
}
// ...existing code...