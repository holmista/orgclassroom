import dotenv from "dotenv";
dotenv.config();
import querystring from "query-string";
import axios from "axios";
import SocialClient from "../../lib/socialClient.js";

interface ITokens {
  access_token: string;
  refresh_token: string;
  id_token: string;
}

class GoogleClient extends SocialClient {
  grant_type: string;
  constructor(
    client_id: string,
    client_secret: string,
    redirect_uri: string,
    grant_type: string,
    scope: string
  ) {
    super(client_id, client_secret, redirect_uri, scope);
    this.grant_type = grant_type;
  }
  generateAuthUrl() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
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
        scope: this.scope,
      });
      const access_token: string = response.data.access_token;
      const refresh_token: string = response.data.refresh_token;
      const id_token: string = response.data.id_token;
      return { access_token, refresh_token, id_token };
    } catch {
      return null;
    }
  }
  async getUser(access_token: string, id_token: string): Promise<any | null> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      );
      return response.data;
    } catch {
      return null;
    }
  }
}

const googleClient = new GoogleClient(
  process.env.GOOGLE_CLIENT_ID as string,
  process.env.GOOGLE_CLIENT_SECRET as string,
  process.env.GOOGLE_REDIRECT_URL as string,
  "authorization_code",
  "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
);

export default googleClient;

// console.log(
//   googleClient
//     .getUser(
//       "ya29.a0AVvZVspL_Qq3o6x0-siaOKXXz4TYkIQ048gyYqrakc2yCRl1rg3r2AX-iy_JUYthOjPBXHqQxJV_p1qntCXtjVA7V42WERAV8Jur5SmvdLC6hcPYLPn5AenMYOs2hmJRRWcyPdtX9AZ66DntBRCeJbUbarG7aCgYKARASARISFQGbdwaIw3kSFsVBDFNZ4F0yi7P1YQ0163",
//       "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3NDA1MmEyYjY0NDg3NDU3NjRlNzJjMzU5MDk3MWQ5MGNmYjU4NWEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMTc1MDE4MDA5MjQtMWM5aXQ1aG8yZWJwbjlkaGJoNXYzb3UyaDV0bDF2ZWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxMTc1MDE4MDA5MjQtMWM5aXQ1aG8yZWJwbjlkaGJoNXYzb3UyaDV0bDF2ZWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDM0NDY5MTg0NjQ4NzAzNzQ4NTQiLCJoZCI6ImdhdS5lZHUuZ2UiLCJlbWFpbCI6InRvcm5pa2UuYnVjaHVrdXJpQGdhdS5lZHUuZ2UiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6InFTbGdIZ190WGYxT2UwRTBabVUxTmciLCJuYW1lIjoiVG9ybmlrZSBCdWNodWt1cmkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUVkRlRwNmplN3plRkdRZ05hR1RhWm5ZSHNWQld6cG9FQXFOQkFoZjgxNzM9czk2LWMiLCJnaXZlbl9uYW1lIjoiVG9ybmlrZSIsImZhbWlseV9uYW1lIjoiQnVjaHVrdXJpIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2NzU1NDU1ODksImV4cCI6MTY3NTU0OTE4OX0.XaEbEQMIKU_uF2BpSL8GCqyMdgI0sSnB8h03mFZDriDikaL_etk0NPtnYXPCfWlm4VAk6idbS6u8I0pubhtBZImVvVQx7KcAoRUH1j2d2fk6FnTIWP4LlZ_Ov7enwSp_ciMsd4kUMOUaqf-apGW-QQ7yMdj-6dnz_7UCpjFncW2k6fq9eqjWjY624pxrDrqGhHU6S6OxRvlQR5uFOnXe56tiXSLipLvepktPxGxR34KX06GcUTQQc0ofAW_PVH7hckinTd4fRU-Pw_GMQDzyFyeZR0Pv8N1ebvLtE0b5zXHHuwMe6bQJTJ5lBz9rdzJBSwfs1BSa3et9aBV9sA5puA"
//     )
//     .then((user) => console.log(user))
// );
