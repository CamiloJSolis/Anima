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

jest.unstable_mockModule("../services/spotify.service.js", () => {
  return {
    exchangeCodeForTokens: jest.fn(),
    spotifyGet: jest.fn(),
    refreshAccessToken: jest.fn(),
    getClientCredentialsToken: jest.fn(),
    default: {},
  };
});

let spotifyRouter;
let mockedPool;
let spotifyService;

beforeAll(async () => {
  // Asegurar variables de entorno mínimas usadas por la ruta /start y /callback
  process.env.SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "test-client-id";
  process.env.SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "http://localhost/cb";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

  // importar módulos dinámicamente (para que Jest use los mocks declarados arriba)
  const poolModule = await import("../db/pool.js");
  mockedPool = poolModule.pool || poolModule.default || poolModule;

  spotifyService = await import("../services/spotify.service.js");

  const mod = await import("../routes/spotify.routes.js");
  spotifyRouter = mod.default || mod;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Spotify routes", () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
    // montar router en /spotify
    app.use("/spotify", spotifyRouter);
  });

  test("GET /spotify/start -> redirect to Spotify authorize with client_id and scopes", async () => {
    const res = await request(app).get("/spotify/start");
    expect(res.status).toBe(302);
    expect(res.headers).toHaveProperty("location");
    const loc = res.headers.location;
    expect(loc).toContain("accounts.spotify.com/authorize");
    expect(loc).toContain(`client_id=${encodeURIComponent(process.env.SPOTIFY_CLIENT_ID)}`);
    expect(loc).toContain("response_type=code");
    expect(loc).toContain("redirect_uri=");
  });

  test("GET /spotify/callback with existing app cookie (link account) -> inserts linked_accounts and redirects to linked=ok", async () => {
    // preparar mocks
    const tokens = { access_token: "a_tok", refresh_token: "r_tok", scope: "user-read-email" };
    spotifyService.exchangeCodeForTokens.mockResolvedValue(tokens);

    const me = { id: "sp_user_1", email: "sp@example.com", display_name: "SP User" };
    spotifyService.spotifyGet.mockResolvedValue(me);

    // preparar token cookie (usuario ya logueado)
    const payload = { user_id: 55, email: "owner@example.com" };
    const appToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // pool.query: aceptar las inserciones/updates
    mockedPool.query.mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .get("/spotify/callback")
      .query({ code: "somecode" })
      .set("Cookie", [`token=${appToken}`]);

    // La ruta redirige al final
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("analizar?linked=ok");

    // Verificar que se hizo al menos una inserción/actualización en linked_accounts
    const calls = mockedPool.query.mock.calls.flat();
    const calledLinked = mockedPool.query.mock.calls.some(([sql]) =>
      typeof sql === "string" && sql.toLowerCase().includes("linked_accounts")
    );
    expect(calledLinked).toBe(true);

    // exchangeCodeForTokens y spotifyGet fueron llamados
    expect(spotifyService.exchangeCodeForTokens).toHaveBeenCalledWith("somecode");
    expect(spotifyService.spotifyGet).toHaveBeenCalledWith("/me", tokens.access_token);
  });

  test("GET /spotify/callback without cookie and existing linked account -> logs in and sets token cookie", async () => {
    const tokens = { access_token: "X", refresh_token: "Y", scope: "playlist-modify-public" };
    spotifyService.exchangeCodeForTokens.mockResolvedValue(tokens);

    const me = { id: "sp_42", email: "user@spotify", display_name: "UserSpotify" };
    spotifyService.spotifyGet.mockResolvedValue(me);

    // Mock pool.query para la secuencia:
    // 1) check linked_accounts -> return rowCount = 1 with user_id
    // 2) update linked_accounts -> return ok
    // 3) select user -> return user row
    mockedPool.query.mockImplementation((text, params) => {
      const sql = (text || "").toString().toLowerCase();
      if (sql.includes("select la.user_id")) {
        return Promise.resolve({ rowCount: 1, rows: [{ user_id: 99, email: "u@x", username: "u99" }] });
      }
      if (sql.startsWith("update linked_accounts") || sql.includes("insert into linked_accounts")) {
        return Promise.resolve({ rowCount: 1 });
      }
      if (sql.includes("select user_id, email, username from users")) {
        return Promise.resolve({ rows: [{ user_id: 99, email: "u@x", username: "u99" }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app).get("/spotify/callback").query({ code: "code2" });

    // Debe redirigir al login con spotify
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("analizar?login=spotify");

    // Debe establecer cookie 'token'
    const setCookie = res.headers["set-cookie"];
    expect(Array.isArray(setCookie)).toBe(true);
    const tokenCookie = setCookie.find((c) => c.startsWith("token="));
    expect(tokenCookie).toBeDefined();

    // Verificar que pool fue consultado para linked_accounts y luego por usuario
    const calledSelectLink = mockedPool.query.mock.calls.some(([sql]) =>
      typeof sql === "string" && sql.toLowerCase().includes("select la.user_id")
    );
    const calledSelectUser = mockedPool.query.mock.calls.some(([sql]) =>
      typeof sql === "string" && sql.toLowerCase().includes("select user_id, email, username from users")
    );
    expect(calledSelectLink).toBe(true);
    expect(calledSelectUser).toBe(true);
  });
});