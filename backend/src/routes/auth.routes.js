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
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  async (req,res,next)=>{
    try{
      const errors = validationResult(req);
      if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const exists = await pool.query('SELECT 1 FROM users WHERE email=$1',[email]);
      if(exists.rowCount) return res.status(409).json({ error: 'Email en uso' });

      const hash = await bcrypt.hash(password, 12);
      const { rows } = await pool.query(
        `INSERT INTO users(email,password_hash) VALUES($1,$2)
         RETURNING user_id,email`,
        [email, hash]
      );
      const user = rows[0];
      const token = signToken({ user_id: user.user_id, email: user.email });
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

router.get('/me', (req,res)=>{
  const token = req.cookies?.token;
  if(!token) return res.json({ user:null });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user:{ id: payload.user_id, email: payload.email }});
  }catch{ res.json({ user:null }); }
});

export default router;
