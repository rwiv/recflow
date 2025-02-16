import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveEventListener } from '../event/listener.js';
import { ExitCmd } from '../event/event.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { NodeSelector } from '../../node/service/node.selector.js';
import { ChannelInfo } from '../../platform/spec/wapper/channel.js';
import { ChannelAppendWithInfo } from '../../channel/spec/channel.dto.schema.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { FatalError } from '../../utils/errors/errors/FatalError.js';
import { CHANNEL_PRIORIES_VALUE_MAP } from '../../channel/spec/default.priority.constants.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { LiveWriter } from '../access/live.writer.js';
import { LiveFinder } from '../access/live.finder.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';

export interface DeleteOptions {
  purge?: boolean;
  exitCmd?: ExitCmd;
}

@Injectable()
export class LiveRegistrar {
  constructor(
    private readonly listener: LiveEventListener,
    private readonly nodeUpdater: NodeUpdater,
    private readonly nodeSelector: NodeSelector,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
  ) {}

  async add(liveInfo: LiveInfo, channelInfo: ChannelInfo, cr?: CriterionDto) {
    const exists = await this.liveFinder.findByPid(liveInfo.pid);
    if (exists && !exists.isDisabled) {
      throw new ConflictError(`Already exists: ${liveInfo.pid}`);
    }
    let channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, liveInfo.type);
    if (!channel) {
      const append: ChannelAppendWithInfo = {
        // TODO: update
        priorityName: CHANNEL_PRIORIES_VALUE_MAP.none,
        isFollowed: false,
      };
      channel = await this.chWriter.createWithInfo(append, channelInfo);
    }
    const node = await this.nodeSelector.match(channel);
    if (node === null) {
      throw new FatalError(`No node matched for ${liveInfo.pid}`);
    }
    const created = await this.liveWriter.createByLive(liveInfo, node.id);
    await this.nodeUpdater.incrementAssignedCnt(node.id, channel.platform.id);
    await this.listener.onCreate(node.endpoint, created, cr);
    return created;
  }

  async delete(recordId: string, opts: DeleteOptions = {}) {
    let exitCmd = opts.exitCmd;
    if (exitCmd === undefined) {
      exitCmd = 'delete';
    }
    let purge = opts.purge;
    if (purge === undefined) {
      purge = false;
    }

    const live = await this.liveFinder.findById(recordId, { withDeleted: true });
    if (!live) throw NotFoundError.from('LiveRecord', 'id', recordId);

    if (!purge) {
      if (live.isDisabled) throw new ConflictError(`Already deleted: ${recordId}`);
      await this.liveWriter.update(live.id, { isDisabled: true, deletedAt: new Date() });
      await this.nodeUpdater.decrementAssignedCnt(live.nodeId, live.platform.id);
    } else {
      if (!live.isDisabled) {
        await this.nodeUpdater.decrementAssignedCnt(live.nodeId, live.platform.id);
      }
      await this.liveWriter.delete(recordId);
    }

    await this.listener.onDelete(live, exitCmd);

    return live;
  }

  async purgeAll() {
    const lives = await this.liveFinder.findAllDeleted();
    const promises = lives.map((record) => this.delete(record.id, { purge: true }));
    return Promise.all(promises);
  }
}
