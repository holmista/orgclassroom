import dotenv from "dotenv";
dotenv.config();
import GoogleClient from "../../lib/social-clients/googleClient.js";

const googleClient = GoogleClient.getInstance();

function setGoogleAuthURL() {
  const googleLoginUrl = googleClient.generateAuthUrl();
  process.env.GOOGLE_LOGIN_URL = googleLoginUrl;
}

export default setGoogleAuthURL;
