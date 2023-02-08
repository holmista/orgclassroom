import { test, expect, jest } from "@jest/globals";
import getGoogleCodePuppeteer from "../src/helpers/getGoogleCodePuppeteer.js";
import getGithubCodePuppeteer from "../src/helpers/getGithubcodePuppeteer.js";

import googleClient from "../src/configs/googleClient.js";
import githubClient from "../src/configs/githubClient.js";
jest.setTimeout(10000);
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
