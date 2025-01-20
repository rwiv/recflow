import { log } from 'jslog';
import { Cookie } from './types.common.js';

interface ChzzkLiveRequest {
  uid: string;
  once: boolean;
  cookies?: string;
}

// TODO: Rename to SoopLiveRequest
interface AfreecaLiveRequest {
  userId: string;
  once: boolean;
  cred?: SoopCred;
}

export interface SoopCred {
  username: string;
  password: string;
}

export interface Stdl {
  requestChzzkLive(
    url: string,
    uid: string,
    once: boolean,
    cookies: Cookie[] | undefined,
  ): Promise<void>;
  requestSoopLive(
    url: string,
    userId: string,
    once: boolean,
    cred: SoopCred | undefined,
  ): Promise<void>;
}

export class StdlImpl implements Stdl {
  async requestChzzkLive(
    url: string,
    uid: string,
    once: boolean = true,
    cookies: Cookie[] | undefined = undefined,
  ): Promise<void> {
    let chzzkLive: ChzzkLiveRequest = { uid, once };
    if (cookies) {
      chzzkLive = { ...chzzkLive, cookies: JSON.stringify(cookies) };
    }

    const body = JSON.stringify({ reqType: 'chzzk_live', chzzkLive });
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
  }

  async requestSoopLive(
    url: string,
    userId: string,
    once: boolean = true,
    cred: SoopCred | undefined = undefined,
  ): Promise<void> {
    // TODO: Rename to soopLive, SoopLiveRequest
    let afreecaLive: AfreecaLiveRequest = { userId, once };
    if (cred) {
      afreecaLive = { ...afreecaLive, cred };
    }

    // TODO: Rename to soop_live
    const body = JSON.stringify({ reqType: 'afreeca_live', afreecaLive });
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
  }
}

export class StdlMock implements Stdl {
  async requestChzzkLive(
    url: string,
    uid: string,
    once: boolean = true,
    cookies: Cookie[] | undefined = undefined,
  ): Promise<void> {
    log.info(`MockStdlClient.requestChzzkLive(${uid}, ${once}, ${cookies})`);
  }

  async requestSoopLive(
    url: string,
    uid: string,
    once: boolean = true,
    cred: SoopCred | undefined = undefined,
  ): Promise<void> {
    log.info(`MockStdlClient.requestSoopLive(${uid}, ${once}, ${cred})`);
  }
}
