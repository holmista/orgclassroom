import supertest from "supertest";
import { test, expect, beforeEach, afterAll } from "@jest/globals";
import app from "../../src/index.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import emptyDir from "../../src/helpers/emptyDir";
import createUser from "../../prisma/factories/createUserFactory.js";
import createSession from "../../prisma/factories/createSessionFactory.js";
import createSubjectFactory from "../../prisma/factories/createSubjectFactory.js";
import ImageManager from "../../lib/ImageManager.js";
import FileStorageManager from "../../lib/fileStorageManager.js";
import fs from "fs/promises";

const imageManager = ImageManager.getInstance();
const fileStorageManager = FileStorageManager.getInstance();

clearDatabase();
const api = supertest(app);
const agent = supertest.agent(app);

test("return error when creating note without authentication", async () => {
  await api.post("/notes").expect(401);
});

test("return error when creating note without subject id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post("/notes")
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ content: "content" });
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid subject id");
});

test("return error when creating note with invalid subject id", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const res = await agent
    .post("/notes")
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ subjectId: "invalid", content: "content" });
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid subject id");
});

test("return error when creating note with only subject id field", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  await fileStorageManager.createUserFolder(user.id);
  await fileStorageManager.createSubjectFolder(user.id, subject.id);
  const res = await agent
    .post("/notes")
    .set("Cookie", `token=${session.sessionToken}`)
    .send({ subjectId: subject.id });
  expect(res.status).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors.title._errors[0]).toBe("title is required");
  expect(res.body.errors.content._errors[0]).toBe("content is required");
});

test("return error when creating note with invalid content and title fields", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  await fileStorageManager.createUserFolder(user.id);
  await fileStorageManager.createSubjectFolder(user.id, subject.id);
  const res = await agent
    .post("/notes")
    .set("Cookie", `token=${session.sessionToken}`)
    .send({
      subjectId: subject.id,
      title: "t".repeat(192),
      content: "c".repeat(16001),
    });
  expect(res.status).toBe(422);
  expect(res.body).toHaveProperty("errors");
  expect(res.body.errors.content._errors[0]).toBe(
    "content must be less than 16000 characters long"
  );
  expect(res.body.errors.title._errors[0]).toBe(
    "title must be less than 191 characters long"
  );
});

test("return error when creating note with invalid image type", async () => {
  const user = await createUser();
  const session = await createSession(user.id);
  const subject = await createSubjectFactory(user.id);
  await fileStorageManager.createUserFolder(user.id);
  await fileStorageManager.createSubjectFolder(user.id, subject.id);
  const image = {
    mimetype: "image/png",
    originalname: "test.png",
    buffer: await fs.readFile("tests/test-images/test.png"),
  } as Express.Multer.File;

  const res = await agent
    .post("/notes")
    .set("Cookie", `token=${session.sessionToken}`)
    .field("subjectId", subject.id)
    .field("title", "title")
    .field("content", "content")
    .attach("note-files", "tests/test-images/test.png", {
      filename: "test.png",
      contentType: "image/gif",
    });
  expect(res.status).toBe(422);
  expect(res.body.message).toBe("image type not supported");
});

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});

afterAll(async () => {
  await clearDatabase();
  await emptyDir();
});
