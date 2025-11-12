import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/pool.js';

const router = Router();

function signToken(payload){
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1d' });
}

router.post('/register',
  body('username').isLength({ min: 3 }).withMessage('El usuario debe tener al menos 3 caracteres'), //
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'), //
  async (req,res,next)=>{
    try{
      const errors = validationResult(req);
      if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, username } = req.body;
      const exists = await pool.query('SELECT 1 FROM users WHERE email=$1',[email]);
      if(exists.rowCount) return res.status(409).json({ error: 'Email en uso' });

      const hash = await bcrypt.hash(password, 12);
      const { rows } = await pool.query(
        `INSERT INTO users(username, email,password_hash) VALUES($1,$2, $3)
         RETURNING user_id,email, username`,
        [username, email, hash]
      );
      const user = rows[0];
      const token = signToken({ user_id: user.user_id, email: user.email, username: user.username });
      res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true'
      });
      res.json({ user });
    }catch(e){ next(e); }
  }
);

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req,res,next)=>{
    try{
      const { email, password } = req.body;
      const { rows } = await pool.query('SELECT * FROM users WHERE email=$1',[email]);
      const user = rows[0];
      if(!user) return res.status(401).json({ error: 'Credenciales' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if(!ok) return res.status(401).json({ error: 'Credenciales' });

      await pool.query('UPDATE users SET last_login=NOW() WHERE user_id=$1',[user.user_id]);

      const token = signToken({ user_id: user.user_id, email: user.email });
      res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true'
      });
      res.json({ user: { user_id: user.user_id, email: user.email }});
    }catch(e){ next(e); }
  }
);

router.post('/logout', (req,res)=>{
  res.clearCookie('token');
  res.json({ ok:true });
});

router.get('/me', async (req,res)=>{
  const token = req.cookies?.token;
  if(!token) return res.json({ user:null });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
// intentar leer username/email desde la BD para devolver un "name" legible
    const userId = payload.user_id;
    if (!userId) return res.json({ user:null });

    const { rows } = await pool.query('SELECT username, email FROM users WHERE user_id=$1', [userId]);
    const row = rows[0];
    if (!row) return res.json({ user:null });

    const name = row.username && row.username.trim() !== '' 
      ? row.username 
      : (row.email ? row.email.split('@')[0] : null);

    res.json({ user:{ id: userId, email: row.email, name }});
  }catch(err){
    console.log('[auth.me] verify error:', err?.message || err);
    res.json({ user:null });
  }
});

// --- SOLO DESARROLLO: crea/usa un usuario de prueba y setea cookie JWT ---
router.post('/dev-login', async (req, res, next) => {
  try {
    // intenta reutilizar un usuario; si no existe, créalo
    const email = 'test@anima.com';
    let r = await pool.query('SELECT * FROM users WHERE email=$1 LIMIT 1', [email]);
    let user = r.rows[0];

    if (!user) {
      const ins = await pool.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1,$2,'dev_login') RETURNING *`,
        ['tester', email]
      );
      user = ins.rows[0];
    }

    const token = signToken({ user_id: user.user_id, email: user.email });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
    });

    res.json({ ok: true, user: { user_id: user.user_id, email: user.email, username: user.username } });
  } catch (e) { next(e); }
});



export default router;
