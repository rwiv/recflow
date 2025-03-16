import type { Stdl } from '../../infra/stdl/types.js';
import { Authed } from '../../infra/authed/authed.js';
import { log } from 'jslog';
import { Inject, Injectable } from '@nestjs/common';
import { AUTHED, STDL } from '../../infra/infra.module.js';
import { Cookie } from '../../infra/authed/types.js';
import { Dispatcher } from './dispatcher.js';
import { ExitCmd } from './event.schema.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';

@Injectable()
export class LiveEventListener {
  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(AUTHED) private readonly authClient: Authed,
    private readonly dispatcher: Dispatcher,
  ) {}

  async onCreate(nodeEndpoint: string, created: LiveDto, cr?: CriterionDto) {
    await this.requestStdl(nodeEndpoint, created, cr);
  }

  async onDelete(deleted: LiveDto, cmd: ExitCmd) {
    if (cmd !== 'delete') {
      await this.dispatcher.sendExitMessage(cmd, deleted.platform.name, deleted.channel.pid);
    }
    log.info(`Delete: ${deleted.channel.username}`);
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
      let cookies: Cookie[] | undefined = undefined;
      if (enforceCreds || live.isAdult) {
        cookies = await this.authClient.requestSoopCookies();
      }
      await this.stdl.requestSoopLive(nodeEndpoint, live.channel.pid, cookies);
    } else {
      throw new EnumCheckError('Invalid live type');
    }
  }
}
