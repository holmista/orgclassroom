import dotenv from "dotenv";
import queryString from "query-string";
import axios from "axios";
import SocialClient from "../socialClient.js";
dotenv.config();
import { type tokens, ISocialClient, type socialUser } from "../socialClient.js";

class GithubClient extends SocialClient implements ISocialClient {
  static instance: GithubClient;
  private constructor(client_id: string, client_secret: string, redirect_uri: string, scope: string) {
    super(client_id, client_secret, redirect_uri, scope);
  }

  static getInstance() {
    if (!GithubClient.instance) {
      GithubClient.instance = new GithubClient(
        process.env.GITHUB_CLIENT_ID as string,
        process.env.GITHUB_CLIENT_SECRET as string,
        process.env.GITHUB_REDIRECT_URL as string,
        "read:user user:email"
      );
    }
    return GithubClient.instance;
  }

  generateAuthUrl() {
    const params = queryString.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_REDIRECT_URL,
      scope: ["read:user", "user:email"].join(" "),
      allow_signup: true
    });
    const githubLoginUrl = `https://github.com/login/oauth/authorize?${params}`;
    return githubLoginUrl;
  }

  async getTokens(code: string): Promise<tokens> {
    try {
      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: this.client_id,
          client_secret: this.client_secret,
          redirect_uri: this.redirect_uri,
          code
        },
        {
          headers: { Accept: "application/json" }
        }
      );
      if (response.data.error) {
        throw new Error(response.data.error_description);
      }
      return response.data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async getUser(tokens: tokens): Promise<socialUser> {
    try {
      const responseWoEmail = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${tokens.access_token}` }
      });
      const responseWEmail = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `token ${tokens.access_token}` }
      });
      const primaryEmail: string = responseWEmail.data.filter((el: any) => el.primary)[0].email;
      return {
        authProviderId: String(responseWoEmail.data.id),
        name: responseWoEmail.data.login as string,
        email: primaryEmail,
        authProvider: "github"
      };
    } catch (err: any) {
      throw new Error("could not get user data");
    }
  }
}

export default GithubClient;
