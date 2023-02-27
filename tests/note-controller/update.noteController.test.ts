import supertest from "supertest";
import { test, expect, beforeEach, afterAll } from "@jest/globals";
import app from "../../src/index.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import emptyDir from "../../src/helpers/emptyDir";
import createUser from "../../prisma/factories/createUserFactory.js";
import createSession from "../../prisma/factories/createSessionFactory.js";
import createSubjectFactory from "../../prisma/factories/createSubjectFactory.js";
import createNoteFactory from "../../prisma/factories/createNoteFactory.js";

clearDatabase();
const api = supertest(app);
const agent = supertest.agent(app);

test("return error when updating note which does not exist", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const res = await agent
    .put(`/notes/1`)
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ title: "new title", content: "new content" });
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Note not found");
});

test("return error when updating note with invalid id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const res = await agent
    .put(`/notes/invalid-id`)
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ title: "new title", content: "new content" });
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid note id");
});

test("return error when updating note which does not belong to user", async () => {
  const user = await createUser();
  const user2 = await createUser("a@gmail.com", "ggyyy", "google", "gugv45");
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user2.id);
  const note = await createNoteFactory(subject.id);
  const res = await agent
    .put(`/notes/${note.id}`)
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ title: "new title", content: "new content" });
  expect(res.status).toBe(403);
  expect(res.body.message).toBe("Forbidden");
});

test("return error when updating note with invalid title", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const note = await createNoteFactory(subject.id);
  const res = await agent
    .put(`/notes/${note.id}`)
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ title: "a".repeat(192), content: "new content" });
  expect(res.status).toBe(422);
  expect(res.body.errors.title._errors[0]).toBe("title must be less than 191 characters long");
});

test("return error when updating note with invalid content", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const note = await createNoteFactory(subject.id);
  const res = await agent
    .put(`/notes/${note.id}`)
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ title: "new title", content: "a".repeat(16001) });
  expect(res.status).toBe(422);
  expect(res.body.errors.content._errors[0]).toBe("content must be less than 16000 characters long");
});

test("return error when updating node with no fields", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const note = await createNoteFactory(subject.id);
  const res = await agent.put(`/notes/${note.id}`).set("Cookie", `token=${session.sessionToken}`).send({});
  expect(res.status).toBe(422);
  expect(res.body.errors.title._errors[0]).toBe("at least one field must be provided");
});

test("update note with valid data", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const note = await createNoteFactory(subject.id);
  const res = await agent
    .put(`/notes/${note.id}`)
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ title: "new title", content: "new content" });
  expect(res.status).toBe(200);
  expect(res.body.note.title).toBe("new title");
  expect(res.body.note.content).toBe("new content");
});

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});

afterAll(async () => {
  await clearDatabase();
  await emptyDir();
});
