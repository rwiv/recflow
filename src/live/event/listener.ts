import type { Stdl } from '../../infra/stdl/types.js';
import { Authed, SoopCredential } from '../../infra/authed/authed.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { log } from 'jslog';
import { Inject, Injectable } from '@nestjs/common';
import { AUTHED, NOTIFIER, STDL } from '../../infra/infra.module.js';
import { ENV, QUERY } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveInfo } from '../../platform/wapper/live.js';
import { Cookie } from '../../infra/authed/types.js';
import { Dispatcher } from './dispatcher.js';
import { QueryConfig } from '../../common/config/query.js';
import { LiveRecord } from '../business/types.js';
import { ExitCmd } from './types.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';

@Injectable()
export class LiveEventListener {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(AUTHED) private readonly authClient: Authed,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    private readonly dispatcher: Dispatcher,
  ) {}

  async onCreate(created: LiveRecord, webhookUrl: string) {
    // stdl
    await this.requestStdl(webhookUrl, created);

    // ntfy
    await this.notifier.sendLiveInfo(
      this.env.ntfyTopic,
      created.channelName,
      created.viewCnt,
      created.liveTitle,
    );
    return created;
  }

  async onDelete(deleted: LiveInfo, cmd: ExitCmd) {
    if (cmd !== 'delete') {
      await this.dispatcher.exit(cmd, deleted.type, deleted.channelId);
    }
    log.info(`Delete: ${deleted.channelName}`);
    return deleted;
  }

  private async requestStdl(whUrl: string, live: LiveInfo) {
    if (live.type === 'chzzk') {
      const force = this.query.options.chzzk.forceCredentials;
      let cookies: Cookie[] | undefined = undefined;
      if (force || live.adult) {
        cookies = await this.authClient.requestChzzkCookies();
      }
      await this.stdl.requestChzzkLive(whUrl, live.channelId, cookies);
    } else if (live.type === 'soop') {
      const force = this.query.options.soop.forceCredentials;
      let cred: SoopCredential | undefined = undefined;
      if (force || live.adult) {
        cred = await this.authClient.requestSoopCred();
      }
      await this.stdl.requestSoopLive(whUrl, live.channelId, cred);
    } else {
      throw new EnumCheckError('Invalid live type');
    }
  }
}
