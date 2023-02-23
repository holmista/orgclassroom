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
    return { access_token: "mock", id_token: "mock" };
  }
  async getUser(tokens: tokens): Promise<any> {
    return { authProviderId: "mock", name: "mock", email: "mock@gmail.com", authProvider: "mock" };
  }
}
