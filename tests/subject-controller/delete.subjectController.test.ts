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

test("return error when deleting subject without authentication", async () => {
  await api.delete("/subjects/1").expect(401);
});

test("return error when deleting subject with invalid authentication", async () => {
  const token = "invalid";
  const res = await agent.delete("/subjects/6").set("Cookie", [`token=${token}`]);
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Unauthorized");
});

test("return error when deleting subject with expired authentication", async () => {
  const user = await createUser();
  const session = await createSession(user.id, new Date(), new Date(), "token");
  const res = await agent.delete("/subjects").set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Unauthorized");
});

test("return error when deleting subject with invalid id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent.delete("/subjects/invalid").set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(404);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Invalid id");
});

test("return error when deleting subject with non existing id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent.delete("/subjects/6").set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(404);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Subject not found");
});

test("return error when deleting subject with id that does not belong to user", async () => {
  const user1 = await createUser();
  const user2 = await createUser("gg@gmail.com", "gg", "google", "1234");
  const session = await createSession(user1.id);
  const subject = await createSubject(user2.id, "1400", "1500", "test");
  const res = await agent.delete(`/subjects/${subject.id}`).set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(403);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Forbidden");
});

test("return success when deleting subject with valid id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubject(user.id, "1400", "1500", "test");
  const res = await agent.delete(`/subjects/${subject.id}`).set("Cookie", [`token=${session.sessionToken}`]);
  expect(res.statusCode).toBe(204);
});

beforeEach(async () => {
  await clearDatabase();
});
