import type { Stdl } from '../../infra/stdl/types.js';
import { Authed, SoopCredential } from '../../infra/authed/authed.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { log } from 'jslog';
import { Inject, Injectable } from '@nestjs/common';
import { AUTHED, NOTIFIER, STDL } from '../../infra/infra.module.js';
import { ENV, QUERY } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Cookie } from '../../infra/authed/types.js';
import { Dispatcher } from './dispatcher.js';
import { QueryConfig } from '../../common/config/query.js';
import { ExitCmd } from './types.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';
import { LiveRecord } from '../business/live.business.schema.js';

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
      created.channel.username,
      created.viewCnt,
      created.liveTitle,
    );
    return created;
  }

  async onDelete(deleted: LiveRecord, cmd: ExitCmd) {
    if (cmd !== 'delete') {
      await this.dispatcher.exit(cmd, deleted.platform.name, deleted.channel.pid);
    }
    log.info(`Delete: ${deleted.channel.username}`);
    return deleted;
  }

  private async requestStdl(whUrl: string, live: LiveRecord) {
    if (live.platform.name === 'chzzk') {
      const force = this.query.options.chzzk.forceCredentials;
      let cookies: Cookie[] | undefined = undefined;
      if (force || live.adult) {
        cookies = await this.authClient.requestChzzkCookies();
      }
      await this.stdl.requestChzzkLive(whUrl, live.channel.pid, cookies);
    } else if (live.platform.name === 'soop') {
      const force = this.query.options.soop.forceCredentials;
      let cred: SoopCredential | undefined = undefined;
      if (force || live.adult) {
        cred = await this.authClient.requestSoopCred();
      }
      await this.stdl.requestSoopLive(whUrl, live.channel.pid, cred);
    } else {
      throw new EnumCheckError('Invalid live type');
    }
  }
}
