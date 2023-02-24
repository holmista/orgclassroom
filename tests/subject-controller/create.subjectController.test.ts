import supertest from "supertest";
import { test, expect, beforeEach } from "@jest/globals";
import app from "../../src/index.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import createUser from "../../prisma/factories/createUserFactory.js";
import createSession from "../../prisma/factories/createSessionFactory.js";
import emptyDir from "../../src/helpers/emptyDir.js";
import fs from "fs/promises";

clearDatabase();
const api = supertest(app);
const agent = supertest.agent(app);

test("return error when creating subject without authentication", async () => {
  await api.post("/subjects").expect(401);
});

test("return error when creating subject with invalid authentication", async () => {
  const token = "invalid";
  const res = await agent.post("/subjects").set("Cookie", [`token=${token}`]);
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Unauthorized");
});

test("return error when creating subject with expired authentication", async () => {
  const user = await createUser();
  const session = await createSession(user.id, new Date(), new Date(), "token");
  const res = await agent.post("/subjects").set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Unauthorized");
});

test("return errors when creating subject with invalid body", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post("/subjects")
    .set("Cookie", [`token=${session.sessionToken}`])
    .send({ invalid: "invalid" });
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("startTime");
  expect(res.body.errors).toHaveProperty("endTime");
  expect(res.body.errors).toHaveProperty("title");
});

test("return error when creating subject with invalid start time", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post("/subjects")
    .set("Cookie", [`token=${session.sessionToken}`])
    .send({ startTime: "invalid", endTime: "1500", title: "test" });
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("startTime");
});

test("return error when creating subject with invalid end time", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post("/subjects")
    .set("Cookie", [`token=${session.sessionToken}`])
    .send({ startTime: "1400", endTime: "invalid", title: "test" });
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("endTime");
});

test("return error when creating subject with invalid title", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post("/subjects")
    .set("Cookie", [`token=${session.sessionToken}`])
    .send({ startTime: "1400", endTime: "1500", title: "a".repeat(101) });
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("title");
});

test("return error when creating subject with start time greater than end time", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post("/subjects")
    .set("Cookie", [`token=${session.sessionToken}`])
    .send({ startTime: "1500", endTime: "1400", title: "test" });
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("startTime");
});

test("successfully create subject with valid body", async () => {
  const user = await createUser();
  await fs.mkdir(`storage/${user.id}`);
  const session = await createSession(user.id);
  const res = await agent
    .post("/subjects")
    .set("Cookie", [`token=${session.sessionToken}`])
    .send({ startTime: "1400", endTime: "1500", title: "test" });
  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("subject");
  expect(res.body.subject).toHaveProperty("id");
  expect(res.body.subject).toHaveProperty("userId");
  expect(res.body.subject).toHaveProperty("startTime");
  expect(res.body.subject).toHaveProperty("endTime");
  expect(res.body.subject).toHaveProperty("title");
  expect(res.body.subject.userId).toBe(user.id);
  expect(res.body.subject.startTime).toBe("1400");
  expect(res.body.subject.endTime).toBe("1500");
  expect(res.body.subject.title).toBe("test");
  const files = await fs.readdir(`storage/${user.id}`);
  expect(files.length).toBe(1);
}, 10000);

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});
