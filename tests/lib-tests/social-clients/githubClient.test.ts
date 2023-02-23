import { test, expect, jest } from "@jest/globals";
import getGithubCodePuppeteer from "../../../src/helpers/getGithubcodePuppeteer.js";
import GithubClient from "../../../lib/social-clients/githubClient.js";

const githubClient = GithubClient.getInstance();

test("return login url in generate auth url", () => {
  const result = githubClient.generateAuthUrl();
  expect(result).toBeTruthy();
});

test("throw error if invalid code is provided in get tokens", async () => {
  await expect(githubClient.getTokens("123")).rejects.toThrow("The code passed is incorrect or expired");
});

test("return access token if valid code is provided in get tokens", async () => {
  const code = await getGithubCodePuppeteer();
  const result = await githubClient.getTokens(code);
  expect(result).toHaveProperty("access_token");
  expect(result?.access_token).toBeTruthy();
}, 10000);

test("throw error if invalid access token is provided in get user info", async () => {
  await expect(githubClient.getUser({ access_token: "12345" })).rejects.toThrow("Request failed with status code 401");
});

test("return user info if valid access token is provided in get user info", async () => {
  const code = await getGithubCodePuppeteer();
  const tokens = await githubClient.getTokens(code);
  const result = await githubClient.getUser(tokens);
  console.log(result);
  expect(result).toHaveProperty("primary_email");
  expect(result).toHaveProperty("login");
  expect(result).toHaveProperty("id");
  expect(result?.primary_email).toBeTruthy();
  expect(result?.login).toBeTruthy();
  expect(result?.id).toBeTruthy();
}, 10000);
