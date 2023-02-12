import supertest from "supertest";
import { test, expect, beforeEach } from "@jest/globals";
import app from "../../src/index.js";
import getGithubCodePuppeteer from "../../src/helpers/getGithubcodePuppeteer.js";
import db from "../../lib/database.js";

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
  expect(res.body.message).toBe("Something went wrong");
});

test("login user if valid code is provided github", async () => {
  await db.user.delete({ where: { email: "fortestingpurposes317@gmail.com" } });
  const code = await getGithubCodePuppeteer();
  const res = await api.post("/auth/login/github").send({
    code,
  });
  expect(res.statusCode).toBe(200);
  expect(res.header["set-cookie"][0]).toMatch(/token/);
}, 10000);
