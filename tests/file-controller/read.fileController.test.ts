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

test("return error when reading file without authentication", async () => {
  await api.post("/file/1/1/1/huhuhu").expect(401);
});

test("return error when reading file with invalid user id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent.get("/file/invalid/1/1/huhuhu").set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid file path");
});

test("return error when reading file of another user", async () => {
  const user1 = await createUser();
  await fs.mkdir(`storage/${user1.id}/1/1`, { recursive: true });
  const user2 = await createUser("user2@gmail.com", "user2", "google", "dsfjfs");
  await fs.mkdir(`storage/${user2.id}/2/2`, { recursive: true });
  await fs.writeFile(`storage/${user2.id}/2/2/huhuhu.png`, "huhuhu");
  const session = await createSession(user1.id);
  const res = await agent.get(`/file/${user2.id}/2/2/huhuhu.png`).set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(403);
  expect(res.body.message).toBe("Forbidden");
});

test("return error when reading file which does not exist", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent.get(`/file/${user.id}/1/1/huhuhu`).set("Cookie", `token=${session.sessionToken}`);
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Invalid file path");
});

test("return file when reading file", async () => {
  const user = await createUser();
  const subject = await createSubject(user.id);
  const note = await createNote(subject.id);
  await fs.mkdir(`storage/${user.id}/${subject.id}/${note.id}`, { recursive: true });
  await fs.writeFile(`storage/${user.id}/${subject.id}/${note.id}/huhuhu.png`, "huhuhu");
  const session = await createSession(user.id);
  const res = await agent
    .get(`/file/${user.id}/${subject.id}/${note.id}/huhuhu.png`)
    .set("Cookie", `token=${session.sessionToken}`);
  console.log(res.body);
  expect(res.status).toBe(200);
  expect(res.body).toBeTruthy();
});

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});
