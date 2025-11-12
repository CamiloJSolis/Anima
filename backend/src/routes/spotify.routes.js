// /backend/src/routes/spotify.routes.js
import { Router } from 'express';
import { pool } from '../db/pool.js';
import jwt from 'jsonwebtoken';
import {
  exchangeCodeForTokens,
  refreshAccessToken,        // lo sigues teniendo por si lo usan en otro lado
  getClientCredentialsToken,
  spotifyGet,
} from '../services/spotify.service.js';

const router = Router();

/**
 * 1) Iniciar flujo OAuth (login o vincular cuenta)
 * GET /auth/spotify/start
 */
router.get('/start', (req, res) => {
  const scopes = [
    'user-read-email',
    'playlist-modify-public',
    'playlist-modify-private',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: scopes,
  });

  // si viene ?link=1 sabremos en callback que es "vincular"
  const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
  res.redirect(url + (req.query.link ? '&state=link' : ''));
});

/**
 * 2) Callback OAuth
 * GET /auth/spotify/callback
 */
router.get('/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('Missing code');

    const tokens = await exchangeCodeForTokens(code);
    const { access_token, refresh_token } = tokens;

    // Datos del perfil del usuario en Spotify
    const me = await spotifyGet('/me', access_token);
    const provider_user_id = me.id;
    const email = me.email; // puede ser null

    const tokenCookie = req.cookies?.token;

    if (tokenCookie) {
      // Usuario YA logueado en tu app → Vincular cuenta Spotify
      const payload = jwt.verify(tokenCookie, process.env.JWT_SECRET);
      const userId = payload.user_id;

      await pool.query(
        `INSERT INTO linked_accounts(user_id, provider, provider_user_id, access_token, refresh_token, scope, expires_at)
         VALUES($1,'spotify',$2,$3,$4,$5, NOW() + INTERVAL '55 minutes')
         ON CONFLICT (user_id, provider)
         DO UPDATE SET access_token=EXCLUDED.access_token,
                       refresh_token=EXCLUDED.refresh_token,
                       scope=EXCLUDED.scope,
                       expires_at=EXCLUDED.expires_at`,
        [userId, provider_user_id, access_token, refresh_token, tokens.scope || null],
      );

      return res.redirect('http://127.0.0.1:5173/analizar?linked=ok');
    }

    // Usuario NO logueado → “Login con Spotify”
    // 1) buscamos si ya existe una cuenta vinculada con ese provider_user_id
    const link = await pool.query(
      `SELECT la.user_id, u.email, u.username
       FROM linked_accounts la
       JOIN users u ON u.user_id = la.user_id
       WHERE la.provider='spotify' AND la.provider_user_id=$1
       LIMIT 1`,
      [provider_user_id],
    );

    let userId;
    if (link.rowCount) {
      userId = link.rows[0].user_id;
      // actualiza tokens
      await pool.query(
        `UPDATE linked_accounts
         SET access_token=$1,
             refresh_token=$2,
             scope=$3,
             expires_at=NOW() + INTERVAL '55 minutes'
         WHERE user_id=$4 AND provider='spotify'`,
        [access_token, refresh_token, tokens.scope || null, userId],
      );
    } else {
      // crea usuario base (si email existe, intenta reusar)
      let userRow = null;
      if (email) {
        const fq = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        userRow = fq.rows[0] || null;
      }

      if (!userRow) {
        const username = (me.display_name || `sp_${provider_user_id}`)
          .toLowerCase()
          .replace(/\s+/g, '_')
          .slice(0, 30);

        const ins = await pool.query(
          `INSERT INTO users(username,email,password_hash)
           VALUES($1,$2,'spotify_oauth') RETURNING *`,
          [username || `sp_${provider_user_id}`, email || `${provider_user_id}@spotify.local`],
        );
        userRow = ins.rows[0];
      }

      userId = userRow.user_id;

      await pool.query(
        `INSERT INTO linked_accounts(user_id, provider, provider_user_id, access_token, refresh_token, scope, expires_at)
         VALUES($1,'spotify',$2,$3,$4,$5, NOW() + INTERVAL '55 minutes')
         ON CONFLICT (user_id, provider)
         DO UPDATE SET access_token=EXCLUDED.access_token,
                       refresh_token=EXCLUDED.refresh_token,
                       scope=EXCLUDED.scope,
                       expires_at=EXCLUDED.expires_at`,
        [userId, provider_user_id, access_token, refresh_token, tokens.scope || null],
      );
    }

    // Inicia sesión en tu app (JWT cookie)
    const u = await pool.query(
      'SELECT user_id, email, username FROM users WHERE user_id=$1',
      [userId],
    );
    const user = u.rows[0];

    const appToken = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1d' },
    );

    res.cookie('token', appToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
    });

    return res.redirect('http://127.0.0.1:5173/analizar?login=spotify');
  } catch (e) {
    return next(e);
  }
});

/**
 * 3) Endpoint para el carrusel: top tracks de una playlist pública
 * GET /auth/spotify/top-tracks
 */
router.get('/top-tracks', async (req, res, next) => {
  try {
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
    if (!playlistId) {
      return res.status(500).json({ error: 'Falta SPOTIFY_PLAYLIST_ID en .env' });
    }

    const market = process.env.SPOTIFY_MARKET || 'MX';
    /*Por si queremos el limite*/ 
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50
    );
    // 1) Token en modo client_credentials (no depende del usuario)
    const tokenData = await getClientCredentialsToken();
    const accessToken = tokenData.access_token;

    // 2) Leer la playlist
    const playlist = await spotifyGet(`/playlists/${playlistId}`, accessToken, {
      market,
    });
    /* Cambiar por numero o limite*/
    const items = (playlist.tracks?.items || []).slice(0, limit);

    const tracks = items.map((item) => {
      const track = item.track;
      return {
        id: track.id,
        name: track.name,
        artists: track.artists.map((a) => a.name).join(', '),
        image: track.album.images?.[0]?.url ?? null,
        url: track.external_urls?.spotify ?? null,
      };
    });

    return res.json({ tracks });
  } catch (e) {
    console.error('Error en /auth/spotify/top-tracks:', e.response?.data || e.message);
    if (next) return next(e);
    return res.status(500).json({ error: 'No se pudieron obtener canciones de Spotify' });
  }
});

export default router;
