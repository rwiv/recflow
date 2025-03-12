import { Inject, Injectable } from '@nestjs/common';
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
import { NodeUpdater } from '../../node/service/node.updater.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NOTIFIER } from '../../infra/infra.module.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { LiveDto } from '../spec/live.dto.schema.js';

export interface DeleteOptions {
  isPurge?: boolean;
  exitCmd?: ExitCmd;
}

interface CreatedLiveLogAttr {
  platform: string;
  channel: string;
  title: string;
  node?: string;
  assigned?: number;
}

@Injectable()
export class LiveRegistrar {
  constructor(
    private readonly listener: LiveEventListener,
    private readonly nodeSelector: NodeSelector,
    private readonly nodeUpdater: NodeUpdater,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly priService: PriorityService,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
    @Inject(ENV) private readonly env: Env,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
  ) {}

  async add(liveInfo: LiveInfo, channelInfo: ChannelInfo, cr?: CriterionDto, tx: Tx = db) {
    const exists = await this.liveFinder.findByPid(liveInfo.pid, tx);
    if (exists && !exists.isDisabled) {
      throw new ConflictError(`Already exists: ${liveInfo.pid}`);
    }
    let channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, liveInfo.type, false, tx);
    if (!channel) {
      const none = await this.priService.findByNameNotNull(DEFAULT_PRIORITY_NAME);
      const append: ChannelAppendWithInfo = {
        priorityId: none.id,
        isFollowed: false,
      };
      channel = await this.chWriter.createWithInfo(append, channelInfo, tx);
    }

    return tx.transaction(async (txx) => {
      const node = await this.nodeSelector.match(channel, txx);
      const created = await this.liveWriter.createByLive(liveInfo, node?.id ?? null, node === null, txx);
      if (node) {
        await this.nodeUpdater.setLastAssignedAtNow(node.id, txx);
        await this.listener.onCreate(node.endpoint, created, cr);
      }
      if (channel.priority.shouldNotify) {
        await this.notifier.sendLiveInfo(this.env.untf.topic, created);
      }
      this.logCreatedLive(created, node);
      return created;
    });
  }

  private logCreatedLive(live: LiveDto, node: NodeDto | null = null) {
    const attr: CreatedLiveLogAttr = {
      platform: live.platform.name,
      channel: live.channel.username,
      title: live.liveTitle,
    };
    if (node) {
      attr.node = node.name;
      attr.assigned = node.states?.find((s) => s.platform.id === live.platform.id)?.assigned;
    }
    log.info('New Live', attr);
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
      await this.liveWriter.disable(live.id);
    } else {
      // hard delete
      await this.liveWriter.delete(recordId);
    }

    await this.listener.onDelete(live, exitCmd);

    return live;
  }
}
