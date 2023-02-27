import supertest from "supertest";
import { test, expect, beforeEach, afterAll } from "@jest/globals";
import app from "../../src/index.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import emptyDir from "../../src/helpers/emptyDir";
import createUser from "../../prisma/factories/createUserFactory.js";
import createSession from "../../prisma/factories/createSessionFactory.js";
import createSubjectFactory from "../../prisma/factories/createSubjectFactory.js";
import createNote from "../../prisma/factories/createNoteFactory.js";
import fs from "fs/promises";

clearDatabase();
const api = supertest(app);
const agent = supertest.agent(app);

test("return error when creating note without authentication", async () => {
  await api.delete("/file/1/1/test.png").expect(401);
});

test("return error when deleting file with invalid subject id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent.delete("/file/invalid/1/test.png").set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid file path");
});

test("return error when deleting file on note of another user", async () => {
  const user1 = await createUser();
  const user2 = await createUser("user2", "user2", "google", "dsfjfs");
  const subject = await createSubjectFactory(user2.id);
  const note = await createNote(subject.id);
  await fs.mkdir(`storage/${user2.id}/${subject.id}/${note.id}`, { recursive: true });
  await fs.writeFile(`storage/${user2.id}/${subject.id}/${note.id}/test.png`, "test");
  const session = await createSession(user1.id);
  const res = await agent
    .delete(`/file/${subject.id}/${note.id}/test.png`)
    .set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(403);
  expect(res.body.message).toBe("Forbidden");
});

test("return error when deleting file on note which does not exist", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent.delete(`/file/1/1/test.png`).set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Invalid file path");
});

test("delete file", async () => {
  const user = await createUser();
  const subject = await createSubjectFactory(user.id);
  const note = await createNote(subject.id);
  await fs.mkdir(`storage/${user.id}/${subject.id}/${note.id}`, { recursive: true });
  await fs.writeFile(`storage/${user.id}/${subject.id}/${note.id}/test.png`, "test");
  const session = await createSession(user.id);
  const res = await agent
    .delete(`/file/${subject.id}/${note.id}/test.png`)
    .set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(204);
  const files = await fs.readdir(`storage/${user.id}/${subject.id}/${note.id}`);
  expect(files.length).toBe(0);
});

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});
