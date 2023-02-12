import dotenv from "dotenv";
dotenv.config();
import queryString from "query-string";
import axios from "axios";
import SocialClient from "../../lib/socialClient.js";

interface ITokens {
  access_token: string;
}

class GithubClient extends SocialClient {
  constructor(
    client_id: string,
    client_secret: string,
    redirect_uri: string,
    scope: string
  ) {
    super(client_id, client_secret, redirect_uri, scope);
  }
  generateAuthUrl() {
    const params = queryString.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_REDIRECT_URL,
      scope: ["read:user", "user:email"].join(" "),
      allow_signup: true,
    });
    const githubLoginUrl = `https://github.com/login/oauth/authorize?${params}`;
    return githubLoginUrl;
  }
  async getTokens(code: string): Promise<ITokens | null> {
    try {
      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: this.client_id,
          client_secret: this.client_secret,
          redirect_uri: this.redirect_uri,
          code,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (response.data.error) {
        throw new Error(response.data.error_description);
      }
      return response.data;
    } catch {
      return null;
    }
  }
  async getUser(access_token: string): Promise<any | null> {
    try {
      const responseWoEmail = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });
      const responseWEmail = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: {
            Authorization: `token ${access_token}`,
          },
        }
      );
      const primaryEmail: string = responseWEmail.data.filter(
        (el: any) => el.primary
      )[0].email;
      responseWoEmail.data.primary_email = primaryEmail;
      return responseWoEmail.data;
    } catch (err: any) {
      return null;
    }
  }
}

const githubClient = new GithubClient(
  process.env.GITHUB_CLIENT_ID as string,
  process.env.GITHUB_CLIENT_SECRET as string,
  process.env.GITHUB_REDIRECT_URL as string,
  "read:user user:email"
);

export default githubClient;
