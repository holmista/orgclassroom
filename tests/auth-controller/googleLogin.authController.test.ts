import supertest from "supertest";
import { test, expect, beforeEach, jest } from "@jest/globals";
import app from "../../src/index.js";
import emptyDir from "../../src/helpers/emptyDir.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import getGoogleCodePuppeteer from "../../src/helpers/getGoogleCodePuppeteer.js";
import fs from "fs/promises";

const api = supertest(app);

test("return google login url", async () => {
  const res = await api.get("/auth/url/google");
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("url");
  expect(res.body.url).toBe(process.env.GOOGLE_LOGIN_URL);
});

test("do not login user if code is not provided google", async () => {
  const res = await api.post("/auth/login/google").send({});
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("No code provided");
});

test("do not login user if invalid code is provided google", async () => {
  const res = await api.post("/auth/login/google").send({ code: "invalid" });
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(500);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("The code passed is incorrect or expired");
});

test("login user if valid code is provided google", async () => {
  const code = await getGoogleCodePuppeteer();
  const res = await api.post("/auth/login/google").send({
    code
  });
  expect(res.statusCode).toBe(200);
  const files = await fs.readdir("storage");
  expect(files.length).toBe(1);
  expect(res.header["set-cookie"][0]).toMatch(/token/);
}, 10000);

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});
