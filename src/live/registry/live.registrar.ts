import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveEventListener } from '../event/listener.js';
import { ExitCmd } from '../event/event.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { NodeSelector } from '../../node/service/node.selector.js';
import { ChannelInfo } from '../../platform/spec/wapper/channel.js';
import { ChannelAppendWithInfo } from '../../channel/spec/channel.dto.schema.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveWriter } from '../access/live.writer.js';
import { LiveFinder } from '../access/live.finder.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { PriorityService } from '../../channel/service/priority.service.js';
import { DEFAULT_PRIORITY_NAME } from '../../channel/spec/priority.constants.js';
import { log } from 'jslog';

export interface DeleteOptions {
  isPurge?: boolean;
  exitCmd?: ExitCmd;
}

@Injectable()
export class LiveRegistrar {
  constructor(
    private readonly listener: LiveEventListener,
    private readonly nodeSelector: NodeSelector,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly priService: PriorityService,
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
      const none = await this.priService.findByNameNotNull(DEFAULT_PRIORITY_NAME);
      const append: ChannelAppendWithInfo = {
        priorityId: none.id,
        isFollowed: false,
      };
      channel = await this.chWriter.createWithInfo(append, channelInfo);
    }
    const node = await this.nodeSelector.match(channel);
    if (!node) {
      throw new NotFoundError(`No available nodes: channelName="${channel.username}"`);
    }
    const nodeState = node.states?.find((s) => s.platform.id === channel.platform.id);
    const created = await this.liveWriter.createByLive(liveInfo, node.id);
    await this.listener.onCreate(node.endpoint, created, cr);
    log.info('New Live', {
      channelName: created.channel.username,
      title: created.liveTitle,
      node: node.name,
      assigned: nodeState?.assigned,
    });
    return created;
  }

  async remove(recordId: string, opts: DeleteOptions = {}) {
    let exitCmd = opts.exitCmd;
    if (exitCmd === undefined) {
      exitCmd = 'delete';
    }
    let isPurge = opts.isPurge;
    if (isPurge === undefined) {
      isPurge = false;
    }

    const live = await this.liveFinder.findById(recordId, { withDisabled: true });
    if (!live) throw NotFoundError.from('LiveRecord', 'id', recordId);

    if (!isPurge) {
      // soft delete
      if (live.isDisabled) throw new ConflictError(`Already removed live: ${recordId}`);
      await this.liveWriter.update(live.id, { nodeId: null, isDisabled: true, deletedAt: new Date() });
    } else {
      // hard delete
      await this.liveWriter.delete(recordId);
    }

    await this.listener.onDelete(live, exitCmd);

    return live;
  }
}
