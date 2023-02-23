import { test, expect, jest } from "@jest/globals";
import getGoogleCodePuppeteer from "../../../src/helpers/getGoogleCodePuppeteer.js";
import GoogleClient from "../../../lib/social-clients/googleClient.js";

const googleClient = GoogleClient.getInstance();

test("return login url in generate auth url", () => {
  const result = googleClient.generateAuthUrl();
  expect(result).toBeTruthy();
});

test("throw error if invalid code is provided in get tokens", async () => {
  await expect(googleClient.getTokens("123")).rejects.toThrow("The code passed is incorrect or expired");
});

test("return access and id tokens if valid code is provided in get tokens", async () => {
  const code = await getGoogleCodePuppeteer();
  const result = await googleClient.getTokens(code);
  expect(result).toHaveProperty("access_token");
  expect(result?.access_token).toBeTruthy();
  expect(result).toHaveProperty("id_token");
  expect(result?.id_token).toBeTruthy();
}, 10000);

test("throw error if invalid access and id tokens are provided in get user info", async () => {
  await expect(googleClient.getUser({ access_token: "12345", id_token: "12345" })).rejects.toThrow(
    "could not get user data"
  );
});

test("return user info if valid access and id tokens are provided in get user info", async () => {
  const code = await getGoogleCodePuppeteer();
  const tokens = await googleClient.getTokens(code);
  const result = await googleClient.getUser(tokens);
  console.log(result);
  expect(result).toHaveProperty("email");
  expect(result).toHaveProperty("name");
  expect(result).toHaveProperty("id");
  expect(result?.email).toBeTruthy();
  expect(result?.name).toBeTruthy();
  expect(result?.id).toBeTruthy();
}, 15000);
