import queryString from "query-string";
import dotenv from "dotenv";
dotenv.config();
import googleClient from "./googleClient.js";

function setGoogleAuthURL() {
  const googleLoginUrl = googleClient.generateAuthUrl();
  process.env.GOOGLE_LOGIN_URL = googleLoginUrl;
}

export default setGoogleAuthURL;
