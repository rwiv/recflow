import { Injectable } from '@nestjs/common';
import { Cookie } from '../authed/types.js';
import { ChzzkLiveRequest, SoopCred, SoopLiveRequest, Stdl } from './types.js';

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
