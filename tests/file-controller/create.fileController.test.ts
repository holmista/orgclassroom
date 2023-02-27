import supertest from "supertest";
import { test, expect, beforeEach, afterAll } from "@jest/globals";
import app from "../../src/index.js";
import emptyDir from "../../src/helpers/emptyDir";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import createUser from "../../prisma/factories/createUserFactory.js";
import createSession from "../../prisma/factories/createSessionFactory.js";
import createSubject from "../../prisma/factories/createSubjectFactory.js";
import createNote from "../../prisma/factories/createNoteFactory.js";
import fs from "fs/promises";

const api = supertest(app);
const agent = supertest.agent(app);

test("return error when creating file without authentication", async () => {
  await api.post("/file/1/1/1/huhuhu").expect(401);
});

test("return error when creating file with invalid subject id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent.get("/file/invalid/1/huhuhu").set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid file path");
});

test("return error when creating file on note of another user", async () => {
  const user1 = await createUser();
  const user2 = await createUser("user2", "user2", "google", "dsfjfs");
  const subject = await createSubject(user2.id);
  const note = await createNote(subject.id);
  const session = await createSession(user1.id);
  const res = await agent
    .post(`/file/${subject.id}/${note.id}`)
    .set("Cookie", `token=${session.sessionToken}`)
    .attach("note-files", "tests/test-images/test.png");
  expect(res.status).toBe(403);
  expect(res.body.message).toBe("Forbidden");
});

test("return error when creating file on note which does not exist", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post(`/file/1/1`)
    .set("Cookie", `token=${session.sessionToken}`)
    .attach("note-files", "tests/test-images/test.png");
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Invalid file path");
});

test("return error when creating file on subject which does not exist", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post(`/file/1/1`)
    .set("Cookie", `token=${session.sessionToken}`)
    .attach("note-files", "tests/test-images/test.png");
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Invalid file path");
});

test("create file", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubject(user.id);
  const note = await createNote(subject.id);
  await fs.mkdir(`storage/${user.id}/${subject.id}/${note.id}`, { recursive: true });
  const res = await agent
    .post(`/file/${subject.id}/${note.id}`)
    .set("Cookie", `token=${session.sessionToken}`)
    .attach("note-files", "tests/test-images/test.png", {
      filename: "test.png",
      contentType: "image/png"
    });
  expect(res.status).toBe(201);
});

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});
