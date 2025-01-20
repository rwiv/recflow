import { Stdl } from '../client/stdl.js';
import { Authed, SoopCredential } from '../client/authed.js';
import { Notifier } from '../client/notifier.js';
import { TargetRepository } from '../storage/types.js';
import {
  ChzzkWebhookMatcher,
  SoopWebhookMatcher,
  WebhookMatcher,
} from '../webhook/types.js';
import { log } from 'jslog';
import { Inject, Injectable } from '@nestjs/common';
import { AUTHED, NOTIFIER, STDL } from '../client/client.module.js';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';
import { TARGET_REPOSITORY } from '../storage/stroage.module.js';
import {
  WEBHOOK_MATCHER_CHZZK,
  WEBHOOK_MATCHER_SOOP,
} from '../webhook/webhook.module.js';
import { LiveInfo } from '../platform/wrapper.live.js';
import { ChzzkLiveInfo } from '../platform/chzzk.dto.js';
import { SoopLiveInfo } from '../platform/soop.dto.js';
import { Cookie } from '../client/types.common.js';

@Injectable()
export class Allocator {
  private readonly nftyTopic: string;

  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(AUTHED) private readonly authClient: Authed,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(ENV) private readonly env: Env,
    @Inject(TARGET_REPOSITORY)
    private readonly targets: TargetRepository,
    @Inject(WEBHOOK_MATCHER_CHZZK)
    private readonly chzzkMatcher: ChzzkWebhookMatcher,
    @Inject(WEBHOOK_MATCHER_SOOP)
    private readonly soopMatcher: SoopWebhookMatcher,
  ) {
    this.nftyTopic = this.env.ntfyTopic;
  }

  async allocate(live: LiveInfo) {
    const matcher = this.getWebhookMatcher(live);
    const wh = matcher.match(live, await this.targets.whStates());
    if (!wh) {
      // TODO: use ntfy
      log.warn('No webhook');
      return;
    }
    const ret = await this.targets.set(live.channelId, live, wh);

    // stdl
    await this.requestStdl(wh.url, live);

    // ntfy
    await this.notifier.sendLiveInfo(
      this.nftyTopic,
      live.channelName,
      live.viewCnt,
      live.liveTitle,
    );
    return ret;
  }

  async deallocate(live: LiveInfo) {
    const ls = await this.targets.delete(live.channelId);
    log.info(`Delete: ${live.channelName}`);
    return ls;
  }

  private getWebhookMatcher(live: LiveInfo): WebhookMatcher {
    if (live.content instanceof ChzzkLiveInfo) {
      return this.chzzkMatcher;
    } else if (live.content instanceof SoopLiveInfo) {
      return this.soopMatcher;
    } else {
      console.error(typeof live);
      console.error(live);
      throw new Error('Invalid live type');
    }
  }

  private async requestStdl(whUrl: string, live: LiveInfo) {
    if (live.content instanceof ChzzkLiveInfo) {
      let cookies: Cookie[] | undefined = undefined;
      if (live.adult) {
        cookies = await this.authClient.requestChzzkCookies();
      }
      await this.stdl.requestChzzkLive(whUrl, live.channelId, true, cookies);
    } else if (live.content instanceof SoopLiveInfo) {
      let cred: SoopCredential | undefined = undefined;
      if (live.adult) {
        cred = await this.authClient.requestSoopCred();
      }
      await this.stdl.requestSoopLive(whUrl, live.channelId, true, cred);
    } else {
      throw new Error('Invalid live type');
    }
  }
}
