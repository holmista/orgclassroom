import { test, expect } from "@jest/globals";

import { GoogleAuth, GithubAuth } from "../src/controllers/auth.js";

test("give error if invalid code is provided in google login", async () => {
  const googleAuth = new GoogleAuth("123");
  await expect(googleAuth.login()).rejects.toThrow("Something went wrong");
});

test("give error if invalid code is provided in github login", async () => {
  const githubAuth = new GithubAuth("123");
  await expect(githubAuth.login()).rejects.toThrow("Something went wrong");
});
