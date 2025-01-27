import { Cookie } from './types.js';

export interface Authed {
  requestChzzkCookies(): Promise<Cookie[] | undefined>;
  requestSoopCred(): Promise<SoopCredential | undefined>;
}

export interface EncryptedResponse {
  encrypted: string;
}

export interface SoopCredential {
  username: string;
  password: string;
}
