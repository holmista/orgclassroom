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

test("return error when reading note without authentication", async () => {
  await api.get("/notes/1").expect(401);
});

test("return error when reading note with invalid note id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .get("/notes/invalid/invalid")
    .set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid note id");
});

test("return error when reading note with invalid subject id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .get("/notes/1/invalid")
    .set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid subject id");
});

test("return error when reading note which does not exist", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const res = await agent
    .get(`/notes/1/${subject.id}`)
    .set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Note not found");
});

test("return error when reading note which does not belong to user", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const anotherUser = await createUser(
    "a@gmail.com",
    "name",
    "google",
    "hghghvg6"
  );
  const anotherSubject = await createSubjectFactory(anotherUser.id);
  const note = await createNoteFactory(anotherSubject.id);
  const res = await agent
    .get(`/notes/${note.id}/${subject.id}`)
    .set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(403);
  expect(res.body.message).toBe("Forbidden");
});

test("return note when reading note which belongs to user", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const note = await createNoteFactory(subject.id);
  fs.mkdir(`storage/${user.id}/${subject.id}/${note.id}`, { recursive: true });
  const res = await agent
    .get(`/notes/${note.id}/${subject.id}`)
    .set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("note");
});

test("return note with images when reading note which belongs to user", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  const note = await createNoteFactory(subject.id);
  fs.mkdir(`storage/${user.id}/${subject.id}/${note.id}`, { recursive: true });
  const imageData = await fs.readFile("tests/test-images/test.png");
  fs.writeFile(
    `storage/${user.id}/${subject.id}/${note.id}/test.png`,
    imageData
  );
  const res = await agent
    .get(`/notes/${note.id}/${subject.id}`)
    .set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("note");
  expect(res.body.note.files).toHaveLength(1);
});

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});

afterAll(async () => {
  await clearDatabase();
  await emptyDir();
});
