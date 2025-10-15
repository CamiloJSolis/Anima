import jwt from 'jsonwebtoken';

export function signToken(payload){
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1d' });
}

export function requireAuth(req, res, next){
  const token = req.cookies?.token;
  if(!token) return res.status(401).json({ error: 'No auth' });
  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch(e){ return res.status(401).json({ error: 'Invalid token' }); }
}
