import { Stdl } from '../client/stdl.js';
import { Authed } from '../client/authed.js';
import { Notifier } from '../client/notifier.js';
import { ChzzkTargetRepository } from '../storage/types.js';
import { ChzzkWebhookMatcher } from '../webhook/types.js';
import { log } from 'jslog';
import { ChzzkLiveInfo } from '../client/types.chzzk.js';
import { Inject, Injectable } from '@nestjs/common';
import { AUTHED, NOTIFIER, STDL } from '../client/client.module.js';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';
import { TARGET_REPOSITORY_CHZZK } from '../storage/stroage.module.js';
import { WEBHOOK_MATCHER_CHZZK } from '../webhook/webhook.module.js';

@Injectable()
export class AllocatorChzzk {
  private readonly nftyTopic: string;

  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(AUTHED) private readonly authClient: Authed,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(ENV) private readonly env: Env,
    @Inject(TARGET_REPOSITORY_CHZZK)
    private readonly targets: ChzzkTargetRepository,
    @Inject(WEBHOOK_MATCHER_CHZZK)
    private readonly matcher: ChzzkWebhookMatcher,
  ) {
    this.nftyTopic = this.env.ntfyTopic;
  }

  async allocate(live: ChzzkLiveInfo) {
    const wh = this.matcher.match(live, await this.targets.whStates());
    if (!wh) {
      // TODO: use ntfy
      log.warn('No webhook');
      return;
    }
    const ls = await this.targets.set(live.channelId, live, wh);

    // stdl
    let cookies = undefined;
    if (live.adult) {
      cookies = await this.authClient.requestChzzkCookies();
    }
    await this.stdl.requestChzzkLive(wh.url, live.channelId, true, cookies);

    // ntfy
    await this.notifier.sendLiveInfo(
      this.nftyTopic,
      live.channelName,
      live.concurrentUserCount,
      live.liveTitle,
    );
    return ls;
  }

  async deallocate(live: ChzzkLiveInfo) {
    const ls = await this.targets.delete(live.channelId);
    log.info(`Delete: ${live.channelName}`);
    return ls;
  }
}
