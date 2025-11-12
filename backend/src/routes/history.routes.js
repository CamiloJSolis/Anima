// /backend/src/routes/history.routes.js
import { Router } from 'express';
import { fetchHistory, getUserIdFromReq } from '../services/history.service.js';

const router = Router();

// GET /history  -> historial del usuario autenticado
router.get('/', async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const items = await fetchHistory(userId, limit);
    return res.json({ items });
  } catch (e) {
    return next(e);
  }
});

export default router;
