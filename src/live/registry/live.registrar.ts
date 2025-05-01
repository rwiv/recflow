import { Inject, Injectable } from '@nestjs/common';
import { ExitCmd } from '../spec/event.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { NodeSelector, NodeSelectorOptions } from '../../node/service/node.selector.js';
import { ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { ChannelAppendWithInfo, ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveWriter } from '../data/live.writer.js';
import { LiveFinder } from '../data/live.finder.js';
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
import type { Stdl } from '../../infra/stdl/stdl.client.js';
import { LiveFinalizer } from './live.finalizer.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import assert from 'assert';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { Stlink, StreamInfo } from '../../platform/stlink/stlink.js';
import { liveNodeAttr } from '../../common/attr/attr.live.js';

export interface FinishOptions {
  isPurge?: boolean;
  exitCmd?: ExitCmd;
  msg?: string;
}

export interface LiveRegisterRequest {
  channelInfo: ChannelLiveInfo;
  reusableLive?: LiveDtoWithNodes;

  // node selection options
  ignoreNodeIds?: string[];
  criterion?: CriterionDto;
  domesticOnly?: boolean;
  overseasFirst?: boolean;
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
    private readonly dispatcher: LiveFinalizer,
    private readonly stlink: Stlink,
    @Inject(ENV) private readonly env: Env,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
  ) {}

  async register(req: LiveRegisterRequest): Promise<string | null> {
    const liveInfo = req.channelInfo.liveInfo;

    // Check if the live is accessible
    const { platform, pid, username } = req.channelInfo;
    let useCred = liveInfo.isAdult;
    if (req.criterion?.enforceCreds) {
      useCred = true;
    }
    const streamInfo = await this.stlink.fetchStreamInfo(platform, pid, useCred);
    if (!streamInfo) {
      log.debug('This live is inaccessible', { platform, pid, username });
      // live record is not created as it may normalize later
      return null;
    }

    // If channel is not registered, create a new channel
    let channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, liveInfo.type, false);
    if (!channel) {
      const none = await this.priService.findByNameNotNull(DEFAULT_PRIORITY_NAME);
      const append: ChannelAppendWithInfo = { priorityId: none.id, isFollowed: false };
      channel = await this.chWriter.createWithInfo(append, req.channelInfo);
    }

    // Register live
    return db.transaction(async (tx) => {
      return this._register(req, channel, streamInfo, tx);
    });
  }

  private async _register(
    req: LiveRegisterRequest,
    channel: ChannelDto,
    streamInfo: StreamInfo,
    tx: Tx,
  ): Promise<string | null> {
    let live = req.reusableLive;
    const liveInfo = req.channelInfo.liveInfo;

    let node = await this.nodeSelector.match(this.getNodeSelectOpts(req, live, channel), tx);
    if (!channel.priority.shouldSave) {
      node = null;
    }

    // If there is no available node, notify and create a disabled live
    const groups = await this.ngRepo.findAll(tx);
    if (groups.length > 0 && !node) {
      const headMessage = 'No available nodes for assignment';
      const messageFields = `channel=${liveInfo.channelName}, views=${liveInfo.viewCnt}, title=${liveInfo.liveTitle}`;
      this.notifier.notify(this.env.untf.topic, `${headMessage}: ${messageFields}`);

      let disabled = live;
      if (disabled) {
        await this.liveWriter.disable(disabled.id, tx);
      } else {
        disabled = await this.liveWriter.createByLive(liveInfo, null, true, tx);
      }
      log.info(headMessage, liveNodeAttr(disabled));
      return disabled.id;
    }

    // Create live if not exists
    let logMsg = 'Change node in live';
    if (!live) {
      logMsg = 'New Live';
      live = await this.liveWriter.createByLive(liveInfo, streamInfo, !node, tx);
    }

    // Set node
    if (node) {
      await this.liveWriter.bind(live.id, node.id, tx);
      await this.nodeUpdater.setLastAssignedAtNow(node.id, tx);
      if (!(await this.stdlRedis.get(live.id))) {
        await this.stdlRedis.setLiveDto(live);
      }
      await this.stdl.startRecording(node.endpoint, live.id);
    }

    // Send notification
    if (live.channel.priority.shouldNotify) {
      this.notifier.sendLiveInfo(this.env.untf.topic, live);
    }

    log.info(logMsg, liveNodeAttr(live, node));
    return live.id;
  }

  async deregister(live: LiveDto, node: NodeDto, tx: Tx = db) {
    await this.liveWriter.unbind(live.id, node.id, tx);
    await this.dispatcher.cancelRecorder(live, node);
    log.debug('Deregister node in live', liveNodeAttr(live, node));
  }

  async finishLive(recordId: string, deleteOpts: FinishOptions = {}) {
    const exitCmd = deleteOpts.exitCmd ?? 'delete';
    const isPurge = deleteOpts.isPurge ?? false;

    const removedLive = await db.transaction(async (tx) => {
      const live = await this.liveFinder.findById(recordId, { nodes: true, forUpdate: true }, tx);
      if (!live) throw NotFoundError.from('LiveRecord', 'id', recordId);

      if (!isPurge) {
        // soft delete
        if (live.isDisabled) throw new ConflictError(`Already removed live: ${recordId}`);
        await this.liveWriter.disable(live.id, tx);
      } else {
        // hard delete
        await this.liveWriter.delete(recordId, tx);
      }
      return live;
    });

    if (exitCmd !== 'delete') {
      assert(removedLive.nodes);
      await this.dispatcher.finishLive(removedLive, removedLive.nodes, exitCmd);
    }

    log.info(`${deleteOpts.msg ?? 'Delete Live'}: ${exitCmd}`, liveNodeAttr(removedLive));
    return removedLive;
  }

  private getNodeSelectOpts(
    req: LiveRegisterRequest,
    live: LiveDtoWithNodes | undefined,
    channel: ChannelDto,
  ): NodeSelectorOptions {
    let domesticOnly = false;
    if (req.criterion) {
      domesticOnly = req.criterion.domesticOnly;
    }
    if (req.domesticOnly !== undefined) {
      domesticOnly = req.domesticOnly;
    }

    let overseasFirst = channel.overseasFirst;
    if (req.criterion) {
      overseasFirst = req.criterion.overseasFirst;
    }
    if (req.overseasFirst !== undefined) {
      overseasFirst = req.overseasFirst;
    }

    const opts: NodeSelectorOptions = { ignoreNodeIds: [], domesticOnly, overseasFirst };
    if (req.ignoreNodeIds) {
      opts.ignoreNodeIds = [...req.ignoreNodeIds];
    }
    if (live && live.nodes) {
      opts.ignoreNodeIds = [...opts.ignoreNodeIds, ...live.nodes.map((node) => node.id)];
    }

    return opts;
  }
}
