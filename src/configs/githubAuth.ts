import queryString from "query-string";
import dotenv from "dotenv";
dotenv.config();
import githubClient from "./githubClient.js";

function setGithubAuthURL() {
  const githubLoginUrl = githubClient.generateAuthUrl();
  process.env.GITHUB_LOGIN_URL = githubLoginUrl;
  return githubLoginUrl;
}

export default setGithubAuthURL;
