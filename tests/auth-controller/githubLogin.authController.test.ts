import supertest from "supertest";
import { test, expect, beforeEach, afterAll } from "@jest/globals";
import app from "../../src/index.js";
import getGithubCodePuppeteer from "../../src/helpers/getGithubcodePuppeteer.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import emptyDir from "../../src/helpers/emptyDir.js";
import { after } from "node:test";

const api = supertest(app);
const agent = supertest.agent(app);

test("return github login url", async () => {
  const res = await api.get("/auth/url/github");
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("url");
  expect(res.body.url).toBe(process.env.GITHUB_LOGIN_URL);
});

test("do not login user if code is not provided github", async () => {
  const res = await api.post("/auth/login/github").send({});
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("No code provided");
});

test("do not login user if invalid code is provided github", async () => {
  const res = await api.post("/auth/login/github").send({ code: "invalid" });
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(500);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("The code passed is incorrect or expired.");
});

test("login user if valid code is provided github", async () => {
  const code = await getGithubCodePuppeteer();
  const res = await api.post("/auth/login/github").send({
    code
  });
  expect(res.statusCode).toBe(200);
  expect(res.header["set-cookie"][0]).toMatch(/token/);
}, 10000);

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});

afterAll(async () => {
  await clearDatabase();
  await emptyDir();
});
