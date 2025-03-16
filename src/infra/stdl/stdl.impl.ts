import { Inject, Injectable } from '@nestjs/common';
import { Cookie } from '../authed/types.js';
import { ChzzkLiveRequest, SoopLiveRequest, Stdl } from './types.js';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';
import { AUTHED } from '../infra.tokens.js';
import { Authed } from '../authed/authed.js';

@Injectable()
export class StdlImpl implements Stdl {
  constructor(@Inject(AUTHED) private readonly authClient: Authed) {}

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
}
