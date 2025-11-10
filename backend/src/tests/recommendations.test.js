import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

/*
  Mocks ESM antes de importar la ruta
*/
jest.unstable_mockModule("../db/pool.js", () => {
  const mQuery = jest.fn();
  const mPool = { query: mQuery };
  return { pool: mPool, default: mPool };
});

jest.unstable_mockModule("../services/recommendations.service.js", () => {
  return {
    getRecommendationsForEmotion: jest.fn(),
    persistRecommendationSession: jest.fn(),
    default: {},
  };
});

let recommendationsRouter;
let mockedPool;
let getRecommendationsForEmotion;
let persistRecommendationSession;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

  const poolModule = await import("../db/pool.js");
  mockedPool = poolModule.pool || poolModule.default || poolModule;

  const recSvc = await import("../services/recommendations.service.js");
  getRecommendationsForEmotion = recSvc.getRecommendationsForEmotion;
  persistRecommendationSession = recSvc.persistRecommendationSession;

  const mod = await import("../routes/recommendations.routes.js");
  recommendationsRouter = mod.default || mod;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Recommendations routes", () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use("/recommendations", recommendationsRouter);
  });

  test("POST /recommendations -> 400 si falta emotion", async () => {
    const res = await request(app).post("/recommendations").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /recommendations como invitado -> llama getRecommendations y persiste sesión sin userId", async () => {
    getRecommendationsForEmotion.mockResolvedValue({
      tracks: [{ id: "t1" }],
      playlists: [],
      seeds: {},
    });
    persistRecommendationSession.mockResolvedValue({ ok: true });

    const payload = { emotion: "ANGRY", confidence: 0.92 };
    const res = await request(app).post("/recommendations").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("tracks");
    // getRecommendationsForEmotion debe llamarse con userId=null
    expect(getRecommendationsForEmotion).toHaveBeenCalled();
    const calledArg = getRecommendationsForEmotion.mock.calls[0][0];
    expect(calledArg).toMatchObject({ userId: null, emotion: payload.emotion });

    // persistRecommendationSession fue llamado y userId debe ser null
    expect(persistRecommendationSession).toHaveBeenCalled();
    const persistArg = persistRecommendationSession.mock.calls[0][0];
    expect(persistArg).toMatchObject({ userId: null, emotion: payload.emotion });
  });

  test("POST /recommendations como usuario logueado -> userId presente en llamadas", async () => {
    getRecommendationsForEmotion.mockResolvedValue({
      tracks: [{ id: "t2" }],
      playlists: [],
      seeds: {},
    });
    persistRecommendationSession.mockResolvedValue({ ok: true });

    const user = { user_id: 7, email: "u@test" };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    const payload = { emotion: "CALM", confidence: 0.5 };
    const res = await request(app)
      .post("/recommendations")
      .set("Cookie", [`token=${token}`])
      .send(payload);

    expect(res.status).toBe(200);
    // service llamado con userId = 7
    const calledArg = getRecommendationsForEmotion.mock.calls[0][0];
    expect(calledArg.userId).toBe(user.user_id);
    expect(calledArg.emotion).toBe(payload.emotion);

    const persistArg = persistRecommendationSession.mock.calls[0][0];
    expect(persistArg.userId).toBe(user.user_id);
    expect(persistArg.emotion).toBe(payload.emotion);
  });

  test("GET /recommendations/history -> 401 si no auth", async () => {
    const res = await request(app).get("/recommendations/history");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /recommendations/history -> devuelve rows para usuario autenticado", async () => {
    const user = { user_id: 11, email: "h@test" };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    const fakeRows = [
      { id: 1, emotion: "CALM", confidence: 0.9, tracks: [], playlists: [], created_at: "now" },
    ];
    mockedPool.query.mockResolvedValueOnce({ rows: fakeRows });

    const res = await request(app).get("/recommendations/history").set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(fakeRows);

    // comprobar que pool.query fue llamado con userId como primer parámetro
    const calledParams = mockedPool.query.mock.calls[0][1];
    expect(calledParams[0]).toBe(user.user_id);
  });

  test("GET /recommendations/weekly-summary -> 401 si no auth", async () => {
    const res = await request(app).get("/recommendations/weekly-summary");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /recommendations/weekly-summary -> devuelve dominante para usuario autenticado", async () => {
    const user = { user_id: 22, email: "w@test" };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    // simular que pool.query devuelve la fila dominante
    mockedPool.query.mockResolvedValueOnce({ rows: [{ emotion: "HAPPY", cnt: 3 }] });

    const res = await request(app).get("/recommendations/weekly-summary").set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("dominant_emotion", "HAPPY");
    expect(res.body).toHaveProperty("count", 3);

    // comprobar que pool.query recibió userId en params
    const calledParams = mockedPool.query.mock.calls[0][1];
    expect(calledParams[0]).toBe(user.user_id);
  });
});