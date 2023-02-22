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
  abstract getTokens(code: string): Promise<unknown | null>;
  abstract getUser(access_token: string, id_token: string | undefined): Promise<unknown | null>;
}

export default SocialClient;
