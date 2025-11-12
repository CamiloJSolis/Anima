  import { RekognitionClient, DetectFacesCommand } from "@aws-sdk/client-rekognition";

  /**
   * analyzeEmotion(imageBuffer)
   * - imageBuffer: Buffer con los bytes de la imagen
   * Devuelve: { dominantEmotion: { Type, Confidence }, emotions: [...], faceDetails: {...} }
   */
  export async function analyzeEmotion(imageBuffer) {
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
      const e = new TypeError("imageBuffer debe ser un Buffer");
      e.status = 400;
      throw e;
    }

    const client = new RekognitionClient({
      region: process.env.AWS_REGION || "us-east-1"
      // NOTA: las credenciales se leen automáticamente desde process.env (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
    });

    const cmd = new DetectFacesCommand({
      Image: { Bytes: imageBuffer },
      Attributes: ["ALL"] // pide emociones y más detalles de la cara
    });

    try {
      const res = await client.send(cmd);
      const faces = res.FaceDetails || [];

      if (faces.length === 0) {
        return { dominantEmotion: null, emotions: [], faceDetails: null };
      }

      // Tomamos la primera cara detectada (puedes cambiar la lógica para multi-face)
      const face = faces[0];
      const emotions = Array.isArray(face.Emotions) ? face.Emotions : [];

      // Encontrar emoción dominante por Confidence
      let dominant = null;
      for (const e of emotions) {
        if (!dominant || (e.Confidence ?? 0) > (dominant.Confidence ?? 0)) {
          dominant = e;
        }
      }

      return {
        dominantEmotion: dominant ? { Type: dominant.Type, Confidence: dominant.Confidence } : null,
        emotions,
        faceDetails: face
      };
    } catch (err) {
      // Mapear error de AWS por tamaño u otros
      const awsStatus = err?.$metadata?.httpStatusCode;
      if (awsStatus === 413) {
        const e = new Error('Imagen demasiado grande para Rekognition (max 5 MB)');
        e.status = 413;
        throw e;
      }
      // log para depuración
      console.error('[rekognition] error', err?.name || err, err?.message || err);
      throw err;
    }
  }