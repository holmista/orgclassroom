import supertest from "supertest";
import { test, expect, afterAll } from "@jest/globals";
import app from "../src/index.js";
import getGoogleCodePuppeteer from "../src/helpers/getGoogleCodePuppeteer.js";
import getGithubCodePuppeteer from "../src/helpers/getGithubcodePuppeteer.js";
import db from "../lib/database.js";

const api = supertest(app);
const agent = supertest.agent(app);

test("return google login url", async () => {
  const res = await api.get("/auth/url/google");
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("url");
  expect(res.body.url).toBe(process.env.GOOGLE_LOGIN_URL);
});

test("return github login url", async () => {
  const res = await api.get("/auth/url/github");
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("url");
  expect(res.body.url).toBe(process.env.GITHUB_LOGIN_URL);
});

test("do not login user if code is not provided google", async () => {
  const res = await api.post("/auth/login/google").send({});
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("No code provided");
});

test("do not login user if code is not provided github", async () => {
  const res = await api.post("/auth/login/github").send({});
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
  expect(res.body.message).toBe("Something went wrong");
});

test("do not login user if invalid code is provided github", async () => {
  const res = await api.post("/auth/login/github").send({ code: "invalid" });
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.statusCode).toBe(500);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Something went wrong");
});

test("login user if valid code is provided google", async () => {
  const code = await getGoogleCodePuppeteer();
  const res = await api.post("/auth/login/google").send({
    code,
  });
  expect(res.statusCode).toBe(200);
  expect(res.header["set-cookie"][0]).toMatch(/token/);
}, 10000);

test("login user if valid code is provided github", async () => {
  await db.user.delete({ where: { email: "fortestingpurposes317@gmail.com" } });
  const code = await getGithubCodePuppeteer();
  const res = await api.post("/auth/login/github").send({
    code,
  });
  expect(res.statusCode).toBe(200);
  expect(res.header["set-cookie"][0]).toMatch(/token/);
}, 10000);

test("return error on logout if user is not logged in", async () => {
  const res = await api.get("/auth/logout");
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("No token provided");
});

test("return error if invalid session token is provided when logging out", async () => {
  const token = "ggyugyugyuv56fycf";
  const res = await agent
    .get("/auth/logout")
    .set("Cookie", [`token=${token}`])
    .send({});
  console.log(res.body);
  expect(res.statusCode).toBe(500);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("invalid token");
});
