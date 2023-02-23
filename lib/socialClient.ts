export type tokens = {
  access_token: string;
  id_token?: string;
};

type socialUser = {
  authProviderId: string;
  name: string;
  email: string;
  authProvider: string;
};

abstract class SocialClient {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string;
  constructor(client_id: string, client_secret: string, redirect_uri: string, scope: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_uri = redirect_uri;
    this.scope = scope;
  }
  abstract generateAuthUrl(): string;
  abstract getTokens(code: string): Promise<tokens | null>;
  abstract getUser(tokens: tokens): Promise<socialUser | null>;
}

export default SocialClient;
