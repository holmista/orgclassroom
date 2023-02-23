import dotenv from "dotenv";
dotenv.config();
import querystring from "query-string";
import axios from "axios";
import SocialClient from "../../lib/socialClient.js";
import { type tokens } from "../../lib/socialClient.js";

interface ITokens {
  access_token: string;
  refresh_token: string;
  id_token: string;
}

class GoogleClient extends SocialClient {
  grant_type: string;
  static instance: GoogleClient;
  private constructor(
    client_id: string,
    client_secret: string,
    redirect_uri: string,
    grant_type: string,
    scope: string
  ) {
    super(client_id, client_secret, redirect_uri, scope);
    this.grant_type = grant_type;
  }
  static getInstance() {
    if (!GoogleClient.instance) {
      GoogleClient.instance = new GoogleClient(
        process.env.GOOGLE_CLIENT_ID as string,
        process.env.GOOGLE_CLIENT_SECRET as string,
        process.env.GOOGLE_REDIRECT_URL as string,
        "authorization_code",
        "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
      );
    }
    return GoogleClient.instance;
  }
  generateAuthUrl() {
    console.log();
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
      ].join(" ")
    };
    return `${rootUrl}?${querystring.stringify(options)}`;
  }
  async getTokens(code: string): Promise<ITokens | null> {
    try {
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        code: code,
        client_id: this.client_id,
        client_secret: this.client_secret,
        redirect_uri: this.redirect_uri,
        grant_type: this.grant_type,
        scope: this.scope
      });
      const access_token: string = response.data.access_token;
      const refresh_token: string = response.data.refresh_token;
      const id_token: string = response.data.id_token;
      return { access_token, refresh_token, id_token };
    } catch {
      return null;
    }
  }
  async getUser(tokens: tokens): Promise<any | null> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.id_token}`
          }
        }
      );
      return response.data;
    } catch {
      return null;
    }
  }
}

export default GoogleClient;
