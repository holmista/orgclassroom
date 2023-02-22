import dotenv from "dotenv";
import GithubClient from "./githubClient.js";
dotenv.config();

const githubClient = GithubClient.getInstance();

function setGithubAuthURL() {
  const githubLoginUrl = githubClient.generateAuthUrl();
  process.env.GITHUB_LOGIN_URL = githubLoginUrl;
  return githubLoginUrl;
}

export default setGithubAuthURL;
