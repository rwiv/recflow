import { Inject, Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveEventListener } from '../event/listener.js';
import { ExitCmd } from '../event/event.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { NodeSelector } from '../../node/service/node.selector.js';
import { ChannelInfo } from '../../platform/spec/wapper/channel.js';
import { ChannelAppendWithInfo, ChannelDto } from '../../channel/spec/channel.dto.schema.js';
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
import { AMQP_HTTP, NOTIFIER } from '../../infra/infra.module.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeGroupRepository } from '../../node/storage/node-group.repository.js';
import { AmqpHttp } from '../../infra/amqp/amqp.interface.js';
import { AMQP_EXIT_QUEUE_PREFIX } from '../../common/data/constants.js';

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
    private readonly ngRepo: NodeGroupRepository,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly priService: PriorityService,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
    @Inject(ENV) private readonly env: Env,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(AMQP_HTTP) private readonly amqpHttp: AmqpHttp,
  ) {}

  async add(
    liveInfo: LiveInfo,
    channelInfo: ChannelInfo,
    cr?: CriterionDto,
    ignoreNodeIds: string[] = [],
    tx: Tx = db,
  ): Promise<LiveDto | null> {
    const existingLive = await this.liveFinder.findByPid(liveInfo.pid, tx);
    if (existingLive && !existingLive.isDisabled) {
      throw new ConflictError(`Already exists live: pid=${liveInfo.pid}`);
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

    const node = await this.nodeSelector.match(channel, ignoreNodeIds, tx);

    const topic = this.env.untf.topic;
    const groups = await this.ngRepo.findByTier(channel.priority.tier, tx);
    if (groups.length > 0 && !node) {
      this.notifier.notify(topic, `No available nodes for assignment: ${liveInfo.channelName}`);
      // since the notifications shouldn't keep ringing, the live creation process will continue
    }
    if (await this.existsQueue(channel)) {
      return null;
    }

    return tx.transaction(async (txx) => {
      const created = await this.liveWriter.createByLive(liveInfo, node?.id ?? null, node === null, txx);
      if (node) {
        await this.nodeUpdater.setLastAssignedAtNow(node.id, txx);
        await this.listener.onCreate(node.endpoint, created, cr);
      }

      if (channel.priority.shouldNotify) {
        this.notifier.sendLiveInfo(topic, created);
      }

      this.printLiveCreatedLog(created, node);
      return created;
    });
  }

  private async existsQueue(channel: ChannelDto): Promise<boolean> {
    const prefix = AMQP_EXIT_QUEUE_PREFIX;
    const pfName = channel.platform.name;
    const queues = await this.amqpHttp.fetchByPattern(`${prefix}.*`);
    const existingQueue = queues.find((q) => q.name === `${prefix}.${pfName}.${channel.pid}`);
    if (existingQueue) {
      log.warn('This live is already being recorded', { platform: pfName, channel: channel.username });
      return true;
    }
    return false;
  }

  private printLiveCreatedLog(live: LiveDto, node: NodeDto | null = null) {
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
