import { Cookie } from '../authed/types.js';

export interface ChzzkLiveRequest {
  uid: string;
  cookies?: string;
}

export interface SoopLiveRequest {
  userId: string;
  cred?: SoopCred;
}

export interface SoopCred {
  username: string;
  password: string;
}

export interface Stdl {
  requestChzzkLive(url: string, uid: string, cookies: Cookie[] | undefined): Promise<void>;
  requestSoopLive(url: string, userId: string, cred: SoopCred | undefined): Promise<void>;
}
