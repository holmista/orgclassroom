import queryString from "query-string";
import dotenv from "dotenv";
dotenv.config();

function setGoogleAuthURL() {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: "http://127.0.0.1:5173/auth/google/callback",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "), // space seperated string
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
  });
  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
  process.env.GOOGLE_LOGIN_URL = googleLoginUrl;
}

export default setGoogleAuthURL;
