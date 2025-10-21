// ...existing code...
import { Router } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { analyzeEmotion } from '../services/rekognition.service.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

/**
 * POST /analyze
 * - Form-data: field "photo" (file)
 * Responde: { dominantEmotion, emotions, faceDetails }
 */
router.post('/analyze', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Se requiere archivo en campo "photo"' });
    }
    console.log('[analyze] received file size:', req.file.size);

    const result = await analyzeEmotion(req.file.buffer);

    // Determinar userId: preferir req.user (si existe), sino intentar leer token de cookie
    let userId = req.user?.user_id ?? null;
    try {
      if (!userId) {
        const token = req.cookies?.token;
        if (token) {
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          userId = payload?.user_id ?? null;
        }
      }
    } catch (e) {
      console.log('[analyze] token verify failed:', e.message);
      userId = null;
    }

    // Guardado en BD si hay emoción dominante y userId
    try {
      const dominant = result.dominantEmotion;
      if (dominant && userId) {
        let confidence = typeof dominant.Confidence === 'number' ? dominant.Confidence : parseFloat(dominant.Confidence || 0);
        if (confidence > 1) confidence = confidence / 100; // pasar a 0..1

        const emotionType = (dominant.Type || '').toUpperCase();
        let emotionId = null;
        if (emotionType) {
          const { rows: eRows } = await pool.query('SELECT emotion_id FROM emotions WHERE emotion = $1', [emotionType]);
          if (eRows[0]) {
            emotionId = eRows[0].emotion_id;
          } else {
            const { rows: iRows } = await pool.query('INSERT INTO emotions (emotion) VALUES ($1) RETURNING emotion_id', [emotionType]);
            emotionId = iRows[0].emotion_id;
          }
        }

        if (emotionId) {
          const playlistId = 'TBD';
          const playlistUrl = 'https://example.com/playlist';
          await pool.query(
            `INSERT INTO analysis_history (user_id, emotion_id, confidence, playlist_id, playlist_url)
             VALUES ($1,$2,$3,$4,$5)`,
            [userId, emotionId, confidence, playlistId, playlistUrl]
          );
        }
      }
    } catch (dbErr) {
      console.error('[analyze] db error:', dbErr);
    }

    return res.json(result);
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Archivo demasiado grande (max 5 MB)' });
    }
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

export default router;
// ...existing code...