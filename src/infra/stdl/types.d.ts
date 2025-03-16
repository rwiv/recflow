import { Cookie } from '../authed/types.js';

export interface ChzzkLiveRequest {
  uid: string;
  cookies?: string;
}

export interface SoopLiveRequest {
  userId: string;
  cookies?: string;
}

export interface Stdl {
  requestChzzkLive(url: string, uid: string, cookies: Cookie[] | undefined): Promise<void>;
  requestSoopLive(url: string, userId: string, cookies: Cookie[] | undefined): Promise<void>;
}
