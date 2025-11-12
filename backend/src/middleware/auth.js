import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1d",
  });
}

export function requireAuth(req, res, next) {
  try {
    const cookie = req.headers.cookie || "";
    const m = cookie.match(/token=([^;]+)/);
    if (!m) return res.status(401).json({ error: "No autorizado" });
    const token = m[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
