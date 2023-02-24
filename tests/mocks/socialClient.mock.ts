import SocialClient, { type tokens } from "../../lib/socialClient.js";

export default class SocialClientMock extends SocialClient {
  static instance: SocialClientMock;
  private constructor(client_id: string, client_secret: string, redirect_uri: string, scope: string) {
    super(client_id, client_secret, redirect_uri, scope);
  }

  static getInstance() {
    if (!SocialClientMock.instance) {
      SocialClientMock.instance = new SocialClientMock("abcdefg", "abcdefg", "abcdefg", "read:user user:email");
    }
    return SocialClientMock.instance;
  }
  generateAuthUrl() {
    return "https://mock.com";
  }
  async getTokens(code: string): Promise<tokens> {
    try {
      if (code === "invalid") throw new Error("invalid code");
      if (code === "returnInvalidToken") return { access_token: "invalid", id_token: "invalid" };
      return { access_token: "mock", id_token: "mock" };
    } catch (e: any) {
      throw new Error("The code passed is incorrect or expired");
    }
  }
  async getUser(tokens: tokens): Promise<any> {
    try {
      if (tokens.access_token === "invalid") throw new Error("could not get user data");
      return { authProviderId: "mock", name: "mock", email: "mock@gmail.com", authProvider: "mock" };
    } catch (e: any) {
      throw new Error("could not get user data");
    }
  }
}
