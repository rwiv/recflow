import { log } from 'jslog';
import { Cookie } from './types.js';
import { Injectable } from '@nestjs/common';

interface ChzzkLiveRequest {
  uid: string;
  cookies?: string;
}

interface SoopLiveRequest {
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

@Injectable()
export class StdlImpl implements Stdl {
  async requestChzzkLive(
    url: string,
    uid: string,
    cookies: Cookie[] | undefined = undefined,
  ): Promise<void> {
    let chzzkLive: ChzzkLiveRequest = { uid };
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
    cred: SoopCred | undefined = undefined,
  ): Promise<void> {
    let soopLive: SoopLiveRequest = { userId };
    if (cred) {
      soopLive = { ...soopLive, cred };
    }

    const body = JSON.stringify({ reqType: 'soop_live', soopLive });
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
  }
}

@Injectable()
export class StdlMock implements Stdl {
  async requestChzzkLive(
    url: string,
    uid: string,
    cookies: Cookie[] | undefined = undefined,
  ): Promise<void> {
    log.info(`MockStdlClient.requestChzzkLive(...)`, { url, uid, cookies });
  }

  async requestSoopLive(
    url: string,
    uid: string,
    cred: SoopCred | undefined = undefined,
  ): Promise<void> {
    log.info(`MockStdlClient.requestSoopLive(...)`, { url, uid, cred });
  }
}
