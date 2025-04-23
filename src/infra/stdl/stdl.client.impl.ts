import { Inject, Injectable } from '@nestjs/common';
import { Cookie } from '../authed/types.js';
import {
  ChzzkLiveRequest,
  NodeRecorderStatus,
  nodeStatusResponse,
  SoopLiveRequest,
  Stdl,
} from './stdl.client.js';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';
import { AUTHED } from '../infra.tokens.js';
import { Authed } from '../authed/authed.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

@Injectable()
export class StdlImpl implements Stdl {
  constructor(@Inject(AUTHED) private readonly authClient: Authed) {}

  async getStatus(endpoint: string): Promise<NodeRecorderStatus[]> {
    const res = await fetch(`${endpoint}`);
    return nodeStatusResponse.parse(await res.json()).recorders;
  }

  async requestRecording(nodeEndpoint: string, live: LiveDto, cr?: CriterionDto): Promise<void> {
    let enforceCreds = false;
    if (cr) {
      enforceCreds = cr.enforceCreds;
    }

    if (live.platform.name === 'chzzk') {
      let cookies: Cookie[] | undefined = undefined;
      if (enforceCreds || live.isAdult) {
        cookies = await this.authClient.requestChzzkCookies();
      }
      await this.requestChzzkLive(nodeEndpoint, live.channel.pid, cookies);
    } else if (live.platform.name === 'soop') {
      let cookies: Cookie[] | undefined = undefined;
      if (enforceCreds || live.isAdult) {
        cookies = await this.authClient.requestSoopCookies();
      }
      await this.requestSoopLive(nodeEndpoint, live.channel.pid, cookies);
    } else {
      throw new EnumCheckError('Invalid live type');
    }
  }

  private async requestChzzkLive(
    url: string,
    uid: string,
    cookies: Cookie[] | undefined = undefined,
  ): Promise<void> {
    const chzzkLive: ChzzkLiveRequest = { uid };
    if (cookies) {
      chzzkLive.cookies = JSON.stringify(cookies);
    }
    const body = JSON.stringify({ reqType: 'chzzk_live', chzzkLive });
    await this.request(url, body);
  }

  private async requestSoopLive(
    url: string,
    userId: string,
    cookies: Cookie[] | undefined = undefined,
  ): Promise<void> {
    const soopLive: SoopLiveRequest = { userId };
    if (cookies) {
      soopLive.cookies = JSON.stringify(cookies);
    }
    const body = JSON.stringify({ reqType: 'soop_live', soopLive });
    await this.request(url, body);
  }

  private async request(url: string, body: string): Promise<void> {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
  }

  async cancel(endpoint: string, platform: PlatformName, uid: string): Promise<void> {
    const body = JSON.stringify({
      platform: platform,
      uid: uid,
    });
    await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body,
    });
  }
}
