import { Inject, Injectable } from '@nestjs/common';
import { STDL, VTASK } from '../../infra/infra.tokens.js';
import { ExitCmd } from './event.schema.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { Stdl } from '../../infra/stdl/types.js';
import { StdlDoneMessage, StdlDoneStatus, Vtask } from '../../infra/vtask/types.js';

@Injectable()
export class Dispatcher {
  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(VTASK) private readonly vtask: Vtask,
  ) {}

  async sendExitMessage(nodeEndpoint: string, platform: PlatformName, pid: string, cmd: ExitCmd) {
    const liveStatusList = await this.stdl.getStatus(nodeEndpoint);
    const liveStatus = liveStatusList.find(
      // TODO: add check liveId
      (status) => status.platform === platform && status.channelId === pid,
    );
    if (!liveStatus) {
      throw NotFoundError.from('live', 'platform and channelId', `${platform} ${pid}`);
    }
    await this.stdl.cancel(nodeEndpoint, platform, pid);

    if (cmd === 'delete') {
      return;
    }
    let doneCmd: StdlDoneStatus = 'complete';
    if (cmd === 'cancel') {
      doneCmd = 'canceled';
    }
    const doneMessage: StdlDoneMessage = {
      status: doneCmd,
      platform: liveStatus.platform,
      uid: liveStatus.channelId,
      videoName: liveStatus.videoName,
      fsName: liveStatus.fsName,
    };
    setTimeout(() => {
      this.vtask.addTask(doneMessage);
    }, 60 * 1000);
  }
}
