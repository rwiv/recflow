import { Stdl } from '../client/stdl.js';
import { Authed, SoopCredential } from '../client/authed.js';
import { Notifier } from '../client/notifier.js';
import { SoopTargetRepository } from '../storage/types.js';
import { SoopWebhookMatcher } from '../webhook/types.js';
import { log } from 'jslog';
import { SoopLiveInfo } from '../client/types.soop.js';
import { Inject, Injectable } from '@nestjs/common';
import { AUTHED, NOTIFIER, STDL } from '../client/client.module.js';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';
import { TARGET_REPOSITORY_SOOP } from '../storage/stroage.module.js';
import { WEBHOOK_MATCHER_SOOP } from '../webhook/webhook.module.js';

@Injectable()
export class AllocatorSoop {
  private readonly nftyTopic: string;

  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(AUTHED) private readonly authClient: Authed,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(ENV) private readonly env: Env,
    @Inject(TARGET_REPOSITORY_SOOP)
    private readonly targets: SoopTargetRepository,
    @Inject(WEBHOOK_MATCHER_SOOP)
    private readonly matcher: SoopWebhookMatcher,
  ) {
    this.nftyTopic = this.env.ntfyTopic;
  }

  async allocate(live: SoopLiveInfo) {
    const wh = this.matcher.match(live, await this.targets.whStates());
    if (!wh) {
      // TODO: use ntfy
      log.warn('No webhook');
      return;
    }
    const ls = await this.targets.set(live.userId, live, wh);

    // stdl
    let cred: SoopCredential | undefined = undefined;
    if (live.adult) {
      cred = await this.authClient.requestSoopCred();
    }
    await this.stdl.requestSoopLive(wh.url, live.userId, true, cred);

    // ntfy
    await this.notifier.sendLiveInfo(
      this.nftyTopic,
      live.userNick,
      parseInt(live.totalViewCnt),
      live.broadTitle,
    );
    return ls;
  }

  async deallocate(live: SoopLiveInfo) {
    const ls = await this.targets.delete(live.userId);
    log.info(`Delete: ${live.userId}`);
    return ls;
  }
}
