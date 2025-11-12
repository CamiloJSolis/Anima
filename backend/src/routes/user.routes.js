// /backend/src/routes/user.routes.js
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';

const router = Router();

// Middleware simple para exigir sesión (JWT en cookie httpOnly 'token')
function ensureAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.user_id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * PATCH /user/profile
 * Body (opcionales): { username, email }
 * Devuelve: { user }
 */
router.patch('/profile', ensureAuth, async (req, res, next) => {
  try {
    const { username, email } = req.body || {};
    const sets = [];
    const vals = [];
    let i = 1;

    if (typeof username === 'string' && username.trim()) {
      sets.push(`username = $${i++}`);
      vals.push(username.trim());
    }
    if (typeof email === 'string' && email.trim()) {
      sets.push(`email = $${i++}`);
      vals.push(email.trim());
    }
    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    vals.push(req.userId);
    const q = `
      UPDATE users SET ${sets.join(', ')}
      WHERE user_id = $${i}
      RETURNING user_id, username, email, created_at, last_login
    `;
    const r = await pool.query(q, vals);
    return res.json({ user: r.rows[0] });
  } catch (e) {
    // 23505 = UNIQUE_VIOLATION (username/email ya en uso)
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Username or email already in use' });
    }
    return next(e);
  }
});

/**
 * POST /user/change-password
 * Body: { currentPassword?, newPassword }
 * Reglas:
 *  - Si el usuario es "spotify_oauth": NO requiere currentPassword (está "estableciendo" contraseña)
 *  - Si tiene hash real: requiere currentPassword correcto
 */
router.post('/change-password', ensureAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const u = await pool.query(
      'SELECT user_id, password_hash FROM users WHERE user_id = $1 LIMIT 1',
      [req.userId]
    );
    if (!u.rowCount) return res.status(404).json({ error: 'User not found' });

    const row = u.rows[0];

    // Caso "spotify_oauth": permite setear contraseña sin current
    const isSpotifyOnly = row.password_hash === 'spotify_oauth';

    if (!isSpotifyOnly) {
      if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
        return res.status(400).json({ error: 'Current password required' });
      }
      const ok = await bcrypt.compare(currentPassword, row.password_hash);
      if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE user_id=$2', [hash, req.userId]);

    return res.json({ ok: true, message: isSpotifyOnly ? 'Password set successfully' : 'Password changed successfully' });
  } catch (e) {
    return next(e);
  }
});

export default router;
