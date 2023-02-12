import supertest from "supertest";
import { test, expect, beforeEach } from "@jest/globals";
import app from "../../src/index.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import createUser from "../../prisma/factories/createUserFactory.js";
import createSubject from "../../prisma/factories/createSubjectFactory.js";
import createSession from "../../prisma/factories/createSessionFactory.js";

clearDatabase();
const api = supertest(app);
const agent = supertest.agent(app);

test("return error when getting all subjects without authentication", async () => {
  await api.get("/subjects").expect(401);
});

test("return error when getting all subjects with invalid authentication", async () => {
  const token = "invalid";
  const res = await agent.get("/subjects").set("Cookie", [`token=${token}`]);
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Unauthorized");
});

test("return error when getting all subjects with expired authentication", async () => {
  const user = await createUser();
  const session = await createSession(user.id, new Date(), new Date(), "token");
  const res = await agent
    .get("/subjects")
    .set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Unauthorized");
});

test("return all subjects with valid authentication", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .get("/subjects")
    .set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("subjects");
});

test("return error when id as number is not provided", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .get("/subjects/invalid")
    .set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Invalid id");
});

test("return error when id is number but subject with that id does not exist", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .get("/subjects/1")
    .set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(404);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Subject not found");
});

test("return error when id is number but subject with that user id does not belong to currently authenticated user", async () => {
  const user1 = await createUser();
  const user2 = await createUser("test2@gmail.com", "test2", "google", "1234");
  const session = await createSession(user2.id);
  const subject = await createSubject(user1.id, "1400", "1500", "test");
  const res = await agent
    .get(`/subjects/${subject.id}`)
    .set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(403);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Forbidden");
});

test("return subject with valid id and authentication", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubject(user.id, "1400", "1500", "test");
  const res = await agent
    .get(`/subjects/${subject.id}`)
    .set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("subject");
});

beforeEach(async () => {
  await clearDatabase();
});
