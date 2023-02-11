import supertest from "supertest";
import { test, expect, beforeEach } from "@jest/globals";
import app from "../../src/index.js";
import Session from "../../lib/session.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import createUser from "../../prisma/factories/createUserFactory.js";
import createSubject from "../../prisma/factories/createSubjectFactory.js";

clearDatabase();
const api = supertest(app);
const agent = supertest.agent(app);

test("return error when updating subject without authentication", async () => {
  await api.put("/subjects/1").expect(401);
});

test("return error when updating subject with invalid authentication", async () => {
  const token = "invalid";
  const res = await agent.put("/subjects").set("Cookie", [`token=${token}`]);
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Unauthorized");
});

test("return error when updating subject with invalid id", async () => {
  const user = await createUser();
  const token = await Session.create(user.id);
  const res = await agent
    .put("/subjects/invalid")
    .set("Cookie", [`token=${token}`])
    .send({ title: "test" });
  console.log(res.body.errors);
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Invalid id");
});

test("return error when updating subject with id that does not exist", async () => {
  const user = await createUser();
  const token = await Session.create(user.id);
  const res = await agent
    .put("/subjects/1")
    .set("Cookie", [`token=${token}`])
    .send({ title: "test" });
  expect(res.statusCode).toBe(404);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("Subject not found");
});

test("return error when updating subject with start time greater than end time", async () => {
  const user = await createUser();
  const token = await Session.create(user.id);
  const subject = await createSubject(user.id, "1400", "1500", "test");
  const res = await agent
    .put(`/subjects/${subject.id}`)
    .set("Cookie", [`token=${token}`])
    .send({ startTime: "1500", endTime: "1400", title: "test" });
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("startTime");
});

test("return error when updating subject with start time greater than end time", async () => {
  const user = await createUser();
  const token = await Session.create(user.id);
  const subject = await createSubject(user.id, "1400", "1500", "test");
  const res = await agent
    .put(`/subjects/${subject.id}`)
    .set("Cookie", [`token=${token}`])
    .send({ startTime: "1600" });
  console.log(res.body.errors);
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("startTime");
});

test("return error when updating subject with end time less than start time", async () => {
  const user = await createUser();
  const token = await Session.create(user.id);
  const subject = await createSubject(user.id, "1400", "1500", "test");
  const res = await agent
    .put(`/subjects/${subject.id}`)
    .set("Cookie", [`token=${token}`])
    .send({ endTime: "1300" });
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("endTime");
});

test("return error when updating subject with invalid title", async () => {
  const user = await createUser();
  const token = await Session.create(user.id);
  const subject = await createSubject(user.id, "1400", "1500", "a".repeat(101));
  const res = await agent
    .put(`/subjects/${subject.id}`)
    .set("Cookie", [`token=${token}`])
    .send({ title: "a".repeat(101) });
  expect(res.statusCode).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors).toHaveProperty("title");
});

test("successfully update subject with valid updated start time", async () => {
  const user = await createUser();
  const token = await Session.create(user.id);
  const subject = await createSubject(user.id, "1400", "1500", "test");
  const res = await agent
    .put(`/subjects/${subject.id}`)
    .set("Cookie", [`token=${token}`])
    .send({ startTime: "1300" });
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("subject");
  expect(res.body.subject).toHaveProperty("id");
  expect(res.body.subject).toHaveProperty("userId");
  expect(res.body.subject).toHaveProperty("startTime");
  expect(res.body.subject).toHaveProperty("endTime");
  expect(res.body.subject).toHaveProperty("title");
  expect(res.body.subject.userId).toBe(user.id);
  expect(res.body.subject.startTime).toBe("1300");
  expect(res.body.subject.endTime).toBe("1500");
  expect(res.body.subject.title).toBe("test");
});

test("successfully update subject with valid updated end time", async () => {
  const user = await createUser();
  const token = await Session.create(user.id);
  const subject = await createSubject(user.id, "1400", "1500", "test");
  const res = await agent
    .put(`/subjects/${subject.id}`)
    .set("Cookie", [`token=${token}`])
    .send({ endTime: "1600" });
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("subject");
  expect(res.body.subject).toHaveProperty("id");
  expect(res.body.subject).toHaveProperty("userId");
  expect(res.body.subject).toHaveProperty("startTime");
  expect(res.body.subject).toHaveProperty("endTime");
  expect(res.body.subject).toHaveProperty("title");
  expect(res.body.subject.userId).toBe(user.id);
  expect(res.body.subject.startTime).toBe("1400");
  expect(res.body.subject.endTime).toBe("1600");
  expect(res.body.subject.title).toBe("test");
});

beforeEach(async () => {
  await clearDatabase();
});
