import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

/*
  Mocks ESM: declarar antes de importar el router para que Jest los inyecte.
*/
jest.unstable_mockModule("../db/pool.js", () => {
  const mQuery = jest.fn();
  const mPool = { query: mQuery };
  return {
    pool: mPool,
    default: mPool,
  };
});

jest.unstable_mockModule("bcrypt", () => {
  const compare = jest.fn();
  const hash = jest.fn();
  return {
    compare,
    hash,
    default: { compare, hash },
  };
});

let authRouter;
let mockedPool;
let bcrypt;

beforeAll(async () => {
  // secret de prueba
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

  // Import dinámico para que los mocks definidos arriba sean usados
  const poolModule = await import("../db/pool.js");
  mockedPool = poolModule.pool || poolModule.default || poolModule;

  const bcryptModule = await import("bcrypt");
  bcrypt = bcryptModule.default || bcryptModule;

  const authModule = await import("../routes/auth.routes.js");
  authRouter = authModule.default || authModule;
});

describe("Auth - login / logout / me", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use("/api/auth", authRouter);

    jest.clearAllMocks();
  });

  test("POST /api/auth/login - éxito: devuelve cookie token verificable", async () => {
    const fakeUser = {
      user_id: 42,
      email: "juan@example.com",
      password_hash: "irrelevant",
    };

    // pool.query: SELECT => devuelve usuario; UPDATE => ok
    mockedPool.query.mockImplementation((text, params) => {
      const sql = (text || "").toString().toLowerCase();
      if (sql.startsWith("select")) return Promise.resolve({ rows: [fakeUser] });
      if (sql.startsWith("update")) return Promise.resolve({ rowCount: 1 });
      return Promise.resolve({ rows: [] });
    });

    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "juan@example.com", password: "secreto123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");

    const setCookie = res.headers["set-cookie"];
    expect(Array.isArray(setCookie)).toBe(true);
    const tokenCookie = setCookie.find((c) => c.startsWith("token="));
    expect(tokenCookie).toBeDefined();

    const m = tokenCookie.match(/token=([^;]+)/);
    expect(m).not.toBeNull();
    const token = m[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    expect(payload).toHaveProperty("user_id", fakeUser.user_id);
    expect(payload).toHaveProperty("email", fakeUser.email);
  });

  test("POST /api/auth/login - credenciales inválidas -> 401", async () => {
    mockedPool.query.mockResolvedValue({ rows: [] });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "noexiste@example.com", password: "x" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /api/auth/logout - borra cookie y responde ok", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const setCookie = res.headers["set-cookie"];
    // Express clearCookie genera cookie con token=; y expiración en el pasado
    expect(Array.isArray(setCookie)).toBe(true);
    const cleared = setCookie.find((c) => c.startsWith("token="));
    expect(cleared).toBeDefined();
    expect(cleared).toMatch(/token=(;|expires=|path=)/i);
  });

  test("GET /api/auth/me sin cookie -> user null", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user", null);
  });

  test("GET /api/auth/me con token válido -> devuelve usuario", async () => {
    // Preparar token con payload user_id
    const payload = { user_id: 123, email: "maria@example.com" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Mock de consulta para devolver username/email por user_id
    mockedPool.query.mockImplementation((text, params) => {
      const sql = (text || "").toString().toLowerCase();
      if (sql.includes("select username, email")) {
        return Promise.resolve({ rows: [{ username: "maria", email: "maria@example.com" }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app).get("/api/auth/me").set("Cookie", [`token=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id", payload.user_id);
    expect(res.body.user).toHaveProperty("email", "maria@example.com");
    expect(res.body.user).toHaveProperty("name", "maria");
  });
});