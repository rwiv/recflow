import { Inject, Injectable } from '@nestjs/common';
import { ExitCmd } from '../event/event.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { NodeSelector } from '../../node/service/node.selector.js';
import { ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
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
import { NOTIFIER, STDL, STDL_REDIS } from '../../infra/infra.tokens.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeGroupRepository } from '../../node/storage/node-group.repository.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import type { Stdl } from '../../infra/stdl/stdl.client.js';
import { Dispatcher } from '../event/dispatcher.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import assert from 'assert';

export interface DeleteOptions {
  isPurge?: boolean;
  exitCmd?: ExitCmd;
}

interface CreatedLiveLogAttr {
  platform: string;
  channelId: string;
  channelName: string;
  title: string;
  node?: string;
  assigned?: number;
}

export interface LiveRegisterRequest {
  channelInfo: ChannelLiveInfo;
  criterion?: CriterionDto | undefined;
  live?: LiveDto | undefined;
  ignoreNodeIds?: string[];
}

@Injectable()
export class LiveRegistrar {
  constructor(
    private readonly nodeSelector: NodeSelector,
    private readonly nodeUpdater: NodeUpdater,
    private readonly ngRepo: NodeGroupRepository,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly priService: PriorityService,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
    private readonly fetcher: PlatformFetcher,
    private readonly dispatcher: Dispatcher,
    @Inject(ENV) private readonly env: Env,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
  ) {}

  async register(req: LiveRegisterRequest, tx: Tx = db): Promise<LiveDto | null> {
    let live = req.live;
    const liveInfo = req.channelInfo.liveInfo;
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
      channel = await this.chWriter.createWithInfo(append, req.channelInfo, tx);
    }

    const node = await this.nodeSelector.match(channel, req.ignoreNodeIds ?? [], tx);

    // If there is no available node, notify and create a disabled live
    const groups = await this.ngRepo.findByTier(channel.priority.tier, tx);
    if (groups.length > 0 && !node) {
      const headMessage = 'No available nodes for assignment';
      const messageFields = `channel=${liveInfo.channelName}, views=${liveInfo.viewCnt}, title=${liveInfo.liveTitle}`;
      this.notifier.notify(this.env.untf.topic, `${headMessage}: ${messageFields}`);

      const created = await this.liveWriter.createByLive(liveInfo, null, true, tx);
      this.printLiveLog(headMessage, created, null);
      return created;
    }

    // If the live is inaccessible, do nothing
    const pfName = channel.platform.name;
    const newLiveInfo = (await this.fetcher.fetchChannelWithCheckStream(pfName, channel.pid)).liveInfo;
    if (!newLiveInfo) {
      const { pid, username } = channel;
      log.debug('This live is inaccessible', { platform: pfName, pid, username });
      return null;
    }

    // Create a live
    return tx.transaction(async (txx) => {
      if (!live) {
        live = await this.liveWriter.createByLive(newLiveInfo, node?.id ?? null, node === null, txx);
      }
      if (node) {
        await this.nodeUpdater.setLastAssignedAtNow(node.id, txx);
        await this.stdlRedis.setLiveDto(live);
        await this.stdl.requestRecording(node.endpoint, live, req.criterion);
      }

      if (live.channel.priority.shouldNotify) {
        this.notifier.sendLiveInfo(this.env.untf.topic, live);
      }

      this.printLiveLog('New Live', live, node);
      return live;
    });
  }

  private printLiveLog(message: string, live: LiveDto, node: NodeDto | null) {
    const attr: CreatedLiveLogAttr = {
      platform: live.platform.name,
      channelId: live.channel.pid,
      channelName: live.channel.username,
      title: live.liveTitle,
    };
    if (node) {
      attr.node = node.name;
      attr.assigned = node.states?.find((s) => s.platform.id === live.platform.id)?.assigned;
    }
    log.info(message, attr);
  }

  async deregister(recordId: string, opts: DeleteOptions = {}) {
    let exitCmd = opts.exitCmd;
    if (exitCmd === undefined) {
      exitCmd = 'delete';
    }
    let isPurge = opts.isPurge;
    if (isPurge === undefined) {
      isPurge = false;
    }

    const live = await this.liveFinder.findById(recordId, {
      includeDisabled: true,
      nodes: true,
    });
    if (!live) throw NotFoundError.from('LiveRecord', 'id', recordId);

    if (!isPurge) {
      // soft delete
      if (live.isDisabled) throw new ConflictError(`Already removed live: ${recordId}`);
      await this.liveWriter.disable(live.id);
    } else {
      // hard delete
      await this.liveWriter.delete(recordId);
    }

    if (exitCmd !== 'delete') {
      assert(live.nodes);
      for (const node of live.nodes) {
        await this.dispatcher.sendExitMessage(node.endpoint, live.platform.name, live.channel.pid, exitCmd);
      }
    }
    log.info(`Delete Live: ${live.channel.username}`);

    return live;
  }
}
