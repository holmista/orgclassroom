import { test, expect, jest } from "@jest/globals";
import getGoogleCodePuppeteer from "../../src/helpers/getGoogleCodePuppeteer.js";
import getGithubCodePuppeteer from "../../src/helpers/getGithubcodePuppeteer.js";

import GoogleClient from "../../src/configs/googleClient.js";
import GithubClient from "../../src/configs/githubClient.js";
jest.setTimeout(10000);

const googleClient = GoogleClient.getInstance();
const githubClient = GithubClient.getInstance();

test("return null if invalid code is provided in google get tokens", async () => {
  const result = await googleClient.getTokens("123");
  expect(result).toBeNull();
});

test("return null if invalid code is provided github get tokens", async () => {
  const result = await githubClient.getTokens("123");
  expect(result).toBeNull();
});

test("return access and id tokens if valid code is provided google get tokens", async () => {
  const code = await getGoogleCodePuppeteer();
  const result = await googleClient.getTokens(code);
  expect(result).toHaveProperty("access_token");
  expect(result?.access_token).toBeTruthy();
  expect(result).toHaveProperty("id_token");
  expect(result?.id_token).toBeTruthy();
});

test("return access and id tokens if valid code is provided github get tokens", async () => {
  const code = await getGithubCodePuppeteer();
  const result = await githubClient.getTokens(code);
  expect(result).toHaveProperty("access_token");
  expect(result?.access_token).toBeTruthy();
});

test("return user info if valid access and id tokens are provided google", async () => {
  const code = await getGoogleCodePuppeteer();
  expect(code).toBeTruthy();
  const tokens = await googleClient.getTokens(code);
  expect(tokens).not.toBeNull();
  expect(tokens).toHaveProperty("access_token");
  expect(tokens).toHaveProperty("id_token");
  const validTokens = tokens as { access_token: string; id_token: string };
  const result = await googleClient.getUser(validTokens.access_token, validTokens.id_token);
  expect(result).toHaveProperty("email");
  expect(result).toHaveProperty("name");
  expect(result).toHaveProperty("id");
  expect(result?.email).toBeTruthy();
  expect(result?.name).toBeTruthy();
  expect(result?.id).toBeTruthy();
});

test("return user info if valid access token areis provided github", async () => {
  const code = await getGithubCodePuppeteer();
  expect(code).toBeTruthy();
  const tokens = await githubClient.getTokens(code);
  expect(tokens).not.toBeNull();
  expect(tokens).toHaveProperty("access_token");
  const validTokens = tokens as { access_token: string };
  const result = await githubClient.getUser(validTokens.access_token);
  expect(result).toHaveProperty("primary_email");
  expect(result).toHaveProperty("login");
  expect(result).toHaveProperty("id");
  expect(result?.primary_email).toBeTruthy();
  expect(result?.login).toBeTruthy();
  expect(result?.id).toBeTruthy();
});
