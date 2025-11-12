import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { analyzeEmotion } from "../services/rekognition.service.js";
// --- 1. IMPORTA AMBOS SERVICIOS DE RECOMENDACIONES ---
import {
  getRecommendationsForEmotion,
  persistRecommendationSession,
} from "../services/recommendations.service.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * POST /analyze
 * - Form-data: field "photo" (file)
 * - Lógica "opcional" de auth: funciona para invitados (userId=null)
 * y para usuarios (userId=real), guardando en BDD para estos últimos.
 */
router.post("/analyze", upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ error: 'Se requiere archivo en campo "photo"' });
    }
    console.log("[analyze] received file size:", req.file.size);

    // --- 2. DETERMINAR userId (ANTES de llamar a servicios) ---
    // (Esta es tu lógica, que está correcta)
    let userId = req.user?.user_id ?? null;
    try {
      if (!userId) {
        // Si un middleware 'opcional' no corrió
        const token = req.cookies?.token;
        if (token) {
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          userId = payload?.user_id ?? null;
        }
      }
    } catch (e) {
      console.log(
        "[analyze] token verify failed (usuario es invitado):",
        e.message
      );
      userId = null;
    }
    // --- En este punto, 'userId' es un ID real o es null ---

    // --- 3. ANALIZAR EMOCIÓN ---
    const result = await analyzeEmotion(req.file.buffer);
    const dominant = result.dominantEmotion;
    // Usar 'CALM' como fallback si no se detecta emoción
    const emotionType = (dominant?.Type || "CALM").toUpperCase();
    const rawConfidence = dominant?.Confidence ?? 0;

    let confidenceNum = typeof rawConfidence === 'number' ? rawConfidence : parseFloat(rawConfidence || 0);
    if (confidenceNum > 1) {
        confidenceNum = confidenceNum / 100; // Convierte 91.23 a 0.9123
    }

    // --- 4. GENERAR PLAYLIST (pasando userId para filtrar memoria) ---
    let playlistData = { tracks: [], seeds: null };
    try {
      // ¡Importante! Pasa el objeto completo con 'userId'
      playlistData = await getRecommendationsForEmotion({
        userId: userId, // Pasa el userId (sea null o no)
        emotion: emotionType,
        count: 20,
      });
    } catch (err) {
      console.error("[analyze] recommendations error", err);
    }

    // --- 5. GUARDAR EN BDD (SOLO si hay emoción y userId) ---
    if (dominant && userId) {
      console.log(
        `[analyze] Usuario ${userId} identificado, guardando en BDD...`
      );
      try {
        // --- ACCIÓN A: Guardar en 'recommendation_sessions' y 'user_item_memory' ---
        // (Esto es lo que te faltaba, para que el filtro funcione a futuro)
        await persistRecommendationSession({
          userId: userId,
          emotion: emotionType,
          confidence: confidenceNum,
          tracks: playlistData.tracks, // Los tracks ya generados
          seeds: playlistData.seeds,
        });

        // --- ACCIÓN B: Guardar en 'analysis_history' ---
        // (Esta es tu lógica original, que SÍ funciona y mantenemos)

        let emotionId = null;
        const { rows: eRows } = await pool.query(
          "SELECT emotion_id FROM emotions WHERE emotion = $1",
          [emotionType]
        );
        if (eRows[0]) {
          emotionId = eRows[0].emotion_id;
        } else {
          const { rows: iRows } = await pool.query(
            "INSERT INTO emotions (emotion) VALUES ($1) RETURNING emotion_id",
            [emotionType]
          );
          emotionId = iRows[0].emotion_id;
        }

        if (emotionId) {
          // --- CAMBIO AQUÍ: Guardar los IDs de las canciones ---
          const trackIds = (playlistData.tracks || [])
            .map((t) => t.id)
            .filter(Boolean);

          await pool.query(
            `INSERT INTO analysis_history (user_id, emotion_id, confidence, track_ids)
             VALUES ($1,$2,$3,$4)`,
            [userId, emotionId, confidenceNum, trackIds]
          );
        }
        // --- Fin de ACCIÓN B ---
      } catch (dbErr) {
        console.error(
          "[analyze] db error (guardando sesión o historial):",
          dbErr
        );
        // No detenemos la respuesta al usuario si falla el guardado
      }
    } else {
      console.log(
        "[analyze] Usuario invitado o sin emoción dominante, omitiendo guardado en BDD."
      );
    }

    // --- 6. DEVOLVER RESPUESTA ---
    // Combina el resultado de Rekognition con los datos de la playlist
    return res.json({
      ...result,
      dominantEmotion: dominant ? { ...dominant, Confidence: rawConfidence } : null,
      playlist: {
        title: `${emotionType} Playlist`, // Añade un título
        ...playlistData, // Esto incluye 'tracks' y 'seeds'
      },
    });
  } catch (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ error: "Archivo demasiado grande (max 5 MB)" });
    }
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

export default router;
