import supertest from "supertest";
import { test, expect, beforeEach, afterAll } from "@jest/globals";
import app from "../../src/index.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import emptyDir from "../../src/helpers/emptyDir";
import createUser from "../../prisma/factories/createUserFactory.js";
import createSession from "../../prisma/factories/createSessionFactory.js";
import createSubjectFactory from "../../prisma/factories/createSubjectFactory.js";
import createNoteFactory from "../../prisma/factories/createNoteFactory.js";
import ImageManager from "../../lib/ImageManager.js";
import FileStorageManager from "../../lib/fileStorageManager.js";
import fs from "fs/promises";

const imageManager = ImageManager.getInstance();
const fileStorageManager = FileStorageManager.getInstance();

clearDatabase();
const api = supertest(app);
const agent = supertest.agent(app);

test("return error when deleting note without authentication", async () => {
  const res = await api.delete("/notes/1");
  expect(res.status).toBe(401);
});

test("return error when deleting note which does not exist", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const res = await agent.delete(`/notes/1/${subject.id}`).set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Note not found");
});

test("return error when deleting note with invalid id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const res = await agent.delete(`/notes/invalidId/${subject.id}`).set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid note id");
});

test("return error when deleting note which does not belong to user", async () => {
  const user = await createUser();
  const subject = await createSubjectFactory(user.id);
  const note = await createNoteFactory(subject.id);
  const user2 = await createUser("user2@gmail.com", "user2", "google", "123456");
  const session2 = await createSession(user2.id);
  const res = await agent.delete(`/notes/${note.id}/${subject.id}`).set("Cookie", `token=${session2.sessionToken}`);
  expect(res.status).toBe(403);
  expect(res.body.message).toBe("Forbidden");
});

test("return success when deleting note", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const note = await createNoteFactory(subject.id);
  await fs.mkdir(`storage/${user.id}/${subject.id}/${note.id}`, {
    recursive: true
  });
  const res = await agent.delete(`/notes/${note.id}/${subject.id}`).set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(204);
  const files = await fs.readdir(`storage/${user.id}/${subject.id}`);
  expect(files.length).toBe(0);
});

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});

afterAll(async () => {
  await clearDatabase();
  await emptyDir();
});
