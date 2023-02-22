import supertest from "supertest";
import { test, expect, beforeEach } from "@jest/globals";
import app from "../../src/index.js";
import createUser from "../../prisma/factories/createUserFactory";
import db from "../../lib/database.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";

const api = supertest(app);
const agent = supertest.agent(app);

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

test("logout user if valid session token is provided", async () => {
  const user = await createUser();
  const session = await db.session.create({
    data: {
      userId: user.id,
      createdAt: new Date(),
      expiresAt: new Date(),
      sessionToken: "token"
    }
  });
  const token = session.sessionToken;
  const res = await agent
    .get("/auth/logout")
    .set("Cookie", [`token=${token}`])
    .send({});
  expect(res.statusCode).toBe(200);
});

beforeEach(async () => {
  await clearDatabase();
});
