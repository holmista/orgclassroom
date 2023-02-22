import dotenv from "dotenv";
dotenv.config();
import GoogleClient from "./googleClient.js";

const googleClient = GoogleClient.getInstance();

function setGoogleAuthURL() {
  const googleLoginUrl = googleClient.generateAuthUrl();
  process.env.GOOGLE_LOGIN_URL = googleLoginUrl;
}

export default setGoogleAuthURL;
