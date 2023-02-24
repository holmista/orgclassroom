import { test, expect, beforeEach } from "@jest/globals";
import SocialAuth from "../../lib/socialAuth.js";
import SocialClientMock from "../mocks/socialClient.mock.js";
import clearDatabase from "../../src/helpers/clearDatabase.js";
import emptyDir from "../../src/helpers/emptyDir.js";
import db from "../../lib/database.js";
import createUser from "../../prisma/factories/createUserFactory.js";
import fs from "fs/promises";

const socialAuth = new SocialAuth("mock", SocialClientMock.getInstance());

test("create a user if it already does not exist", async () => {
  await expect(
    socialAuth.createUser({ email: "a@gmail.com", name: "test", authProvider: "test", authProviderId: "ghghj" })
  ).resolves.toBeTruthy();
  const amount = await db.user.count();
  expect(amount).toBe(1);
});

test("do not create a user if user with that email already exists", async () => {
  await createUser("a@gmail.com", "test", "test", "ghghj");
  await expect(
    socialAuth.createUser({ email: "a@gmail.com", name: "test", authProvider: "test", authProviderId: "ghghj" })
  ).resolves.toBeTruthy();
  const amount = await db.user.count();
  expect(amount).toBe(1);
});

test("create a session for a user", async () => {
  const user = await createUser();
  await expect(socialAuth.createSession(user)).resolves.toBeTruthy();
  const amount = await db.session.count();
  expect(amount).toBe(1);
});

test("extend session for a user", async () => {
  const user = await createUser();
  await socialAuth.createSession(user);
  const session = await db.session.findFirst({ where: { userId: user.id } });
  await socialAuth.createSession(user);
  const extendedSession = await db.session.findFirst({ where: { userId: user.id } });
  const amount = await db.session.count();
  expect(<Date>extendedSession?.expiresAt > <Date>session?.expiresAt).toBeTruthy();
  expect(amount).toBe(1);
});

test("throw error if session token is invalid when logging out", async () => {
  await expect(SocialAuth.logout("invalid token")).rejects.toThrow("invalid token");
});

test("delete session when logging out", async () => {
  const user = await createUser();
  await socialAuth.createSession(user);
  const session = await db.session.findFirst({ where: { userId: user.id } });
  await SocialAuth.logout(<string>session?.sessionToken);
  const amount = await db.session.count();
  expect(amount).toBe(0);
});

test("throw error when logging in user and code is invalid", () => {
  const socialAuth = new SocialAuth("invalid", SocialClientMock.getInstance());
  expect(socialAuth.login()).rejects.toThrow("The code passed is incorrect or expired");
});

test("throw error when logging in user and tokens are invalid", () => {
  const socialAuth = new SocialAuth("returnInvalidToken", SocialClientMock.getInstance());
  expect(socialAuth.login()).rejects.toThrow("could not get user data");
});

test("log in a user", async () => {
  await expect(socialAuth.login()).resolves.toBeTruthy();
  const folders = await fs.readdir("./storage");
  expect(folders.length).toBe(1);
  const userAmount = await db.user.count();
  expect(userAmount).toBe(1);
  const sessionAmount = await db.session.count();
  expect(sessionAmount).toBe(1);
});

beforeEach(async () => {
  await clearDatabase();
  await emptyDir();
});
