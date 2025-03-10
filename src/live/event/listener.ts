import type { Stdl } from '../../infra/stdl/types.js';
import { Authed, SoopCredential } from '../../infra/authed/authed.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { log } from 'jslog';
import { Inject, Injectable } from '@nestjs/common';
import { AUTHED, NOTIFIER, STDL } from '../../infra/infra.module.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Cookie } from '../../infra/authed/types.js';
import { Dispatcher } from './dispatcher.js';
import { ExitCmd } from './event.schema.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';

@Injectable()
export class LiveEventListener {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(AUTHED) private readonly authClient: Authed,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    private readonly dispatcher: Dispatcher,
  ) {}

  async onCreate(nodeEndpoint: string, created: LiveDto, cr?: CriterionDto) {
    // stdl
    await this.requestStdl(nodeEndpoint, created, cr);

    // ntfy
    await this.notifier.sendLiveInfo(this.env.ntfyTopic, created);
    return created;
  }

  async onDelete(deleted: LiveDto, cmd: ExitCmd) {
    if (cmd !== 'delete') {
      await this.dispatcher.exit(cmd, deleted.platform.name, deleted.channel.pid);
    }
    log.info(`Delete: ${deleted.channel.username}`);
    return deleted;
  }

  private async requestStdl(nodeEndpoint: string, live: LiveDto, cr?: CriterionDto) {
    let enforceCreds = false;
    if (cr) {
      enforceCreds = cr.enforceCreds;
    }
    if (live.platform.name === 'chzzk') {
      let cookies: Cookie[] | undefined = undefined;
      if (enforceCreds || live.isAdult) {
        cookies = await this.authClient.requestChzzkCookies();
      }
      await this.stdl.requestChzzkLive(nodeEndpoint, live.channel.pid, cookies);
    } else if (live.platform.name === 'soop') {
      let cred: SoopCredential | undefined = undefined;
      if (enforceCreds || live.isAdult) {
        cred = await this.authClient.requestSoopCred();
      }
      await this.stdl.requestSoopLive(nodeEndpoint, live.channel.pid, cred);
    } else {
      throw new EnumCheckError('Invalid live type');
    }
  }
}
