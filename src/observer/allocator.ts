import { Stdl } from '../client/stdl.js';
import { Authed, SoopCredential } from '../client/authed.js';
import { Notifier } from '../client/notifier.js';
import { TargetRepository } from '../storage/target/types.js';
import { ChzzkWebhookMatcher, SoopWebhookMatcher, WebhookMatcher } from '../webhook/types.js';
import { log } from 'jslog';
import { Inject, Injectable } from '@nestjs/common';
import { AUTHED, NOTIFIER, STDL } from '../client/client.module.js';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';
import { TARGET_REPOSITORY } from '../storage/stroage.module.js';
import { WEBHOOK_MATCHER_CHZZK, WEBHOOK_MATCHER_SOOP } from '../webhook/webhook.module.js';
import { LiveInfo } from '../platform/live.js';
import { Cookie } from '../client/types.js';
import { Dispatcher, ExitCmd } from './dispatcher.js';

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
    private readonly dispatcher: Dispatcher,
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
    const created = await this.targets.set(live.channelId, live, wh);

    // stdl
    await this.requestStdl(wh.url, created);

    // ntfy
    await this.notifier.sendLiveInfo(
      this.nftyTopic,
      created.channelName,
      created.viewCnt,
      created.liveTitle,
    );
    return created;
  }

  async deallocate(live: LiveInfo, cmd: ExitCmd = 'delete') {
    const deleted = await this.targets.delete(live.channelId);
    if (cmd !== 'delete') {
      await this.dispatcher.send(cmd, live.type, live.channelId);
    }
    log.info(`Delete: ${live.channelName}`);
    return deleted;
  }

  private getWebhookMatcher(live: LiveInfo): WebhookMatcher {
    if (live.type === 'chzzk') {
      return this.chzzkMatcher;
    } else if (live.type === 'soop') {
      return this.soopMatcher;
    } else {
      console.error(typeof live);
      console.error(live);
      throw new Error('Invalid live type');
    }
  }

  private async requestStdl(whUrl: string, live: LiveInfo) {
    if (live.type === 'chzzk') {
      let cookies: Cookie[] | undefined = undefined;
      if (live.adult) {
        cookies = await this.authClient.requestChzzkCookies();
      }
      await this.stdl.requestChzzkLive(whUrl, live.channelId, true, cookies);
    } else if (live.type === 'soop') {
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
