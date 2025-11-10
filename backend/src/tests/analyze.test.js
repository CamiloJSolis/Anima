import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

/*
  Test unitario simplificado para /api/analyze:
  - mockea rekognition.service.analyzeEmotion y recommendations.service.getRecommendationsForEmotion
  - sólo valida que la emoción dominante llega en la respuesta y que se pidió recomendaciones
*/

jest.unstable_mockModule("../services/rekognition.service.js", () => {
  return {
    analyzeEmotion: jest.fn(),
    default: { analyzeEmotion: jest.fn() },
  };
});

jest.unstable_mockModule("../services/recommendations.service.js", () => {
  return {
    getRecommendationsForEmotion: jest.fn(),
    default: { getRecommendationsForEmotion: jest.fn() },
  };
});

let analyzeRouter;
let analyzeEmotion;
let getRecommendationsForEmotion;

beforeAll(async () => {
  // importar dinámicamente después de declarar mocks
  const rek = await import("../services/rekognition.service.js");
  analyzeEmotion = rek.analyzeEmotion || rek.default?.analyzeEmotion;

  const rec = await import("../services/recommendations.service.js");
  getRecommendationsForEmotion = rec.getRecommendationsForEmotion || rec.default?.getRecommendationsForEmotion;

  const mod = await import("../routes/analyze.routes.js");
  analyzeRouter = mod.default || mod;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Analyze route — unitario (emocion + req recomendaciones)", () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use("/api", analyzeRouter);
  });

  test("POST /api/analyze -> devuelve dominantEmotion y solicita recomendaciones", async () => {
    // mock de rekognition: devolver ANG RY
    analyzeEmotion.mockResolvedValue({
      dominantEmotion: { Type: "ANGRY", Confidence: 96 },
      emotions: [{ Type: "ANGRY", Confidence: 96 }],
      faceDetails: {},
    });

    // mock de recommendations: devolver estructura mínima
    getRecommendationsForEmotion.mockResolvedValue({
      tracks: [{ id: "t1", name: "Demo Song" }],
      seeds: {},
    });

    const res = await request(app)
      .post("/api/analyze")
      .attach("photo", Buffer.from("fake-image-bytes"), "photo.jpg");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("dominantEmotion");
    expect(res.body.dominantEmotion).toHaveProperty("Type", "ANGRY");

    // comprobar que solicitó recomendaciones con la emoción correcta
    expect(getRecommendationsForEmotion).toHaveBeenCalled();
    // opcional: argumento esperado (puede ser el string "ANGRY" o lowercase según tu implementación)
    const calledWith = getRecommendationsForEmotion.mock.calls[0]?.[0];
    // validar que la emoción pasada contiene "angry" (case-insensitive)
    expect(String(calledWith).toLowerCase()).toContain("angry");
  });
});