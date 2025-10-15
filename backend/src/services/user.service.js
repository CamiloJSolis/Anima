import { pool } from '../db/pool.js';

export async function findUserByEmail(email){
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  return rows[0];
}

export async function createUser({ email, passwordHash }){
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING user_id,email,created_at`,
    [email, passwordHash]
  );
  return rows[0];
}

export async function updateLastLogin(userId){
  await pool.query('UPDATE users SET last_login=NOW() WHERE user_id=$1', [userId]);
}
