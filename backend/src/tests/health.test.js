import request from "supertest";
import app from "../index.js";

describe("Health endpoint", () => {
  test("GET /__health -> 200 OK", async () => {
    const res = await request(app).get("/__health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
  });
});