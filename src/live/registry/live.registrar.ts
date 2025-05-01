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
import { LiveDispatcher } from './live.dispatcher.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import assert from 'assert';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { Stlink } from '../../platform/stlink/stlink.js';

export interface DeleteOptions {
  isPurge?: boolean;
  exitCmd?: ExitCmd;
  msg?: string;
}

interface CreatedLiveLogAttr {
  liveId: string;
  platform: string;
  channelId: string;
  channelName: string;
  title: string;
  node?: string;
  assigned?: number;
}

export interface LiveRegisterRequest {
  channelInfo: ChannelLiveInfo;
  criterion?: CriterionDto;
  live?: LiveDtoWithNodes;
  failedNode?: NodeDto;
  ignoreNodeIds?: string[];
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
    private readonly dispatcher: LiveDispatcher,
    private readonly stlink: Stlink,
    @Inject(ENV) private readonly env: Env,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
  ) {}

  async register(req: LiveRegisterRequest, tx: Tx = db): Promise<LiveDto | null> {
    let live = req.live;
    const liveInfo = req.channelInfo.liveInfo;

    let channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, liveInfo.type, false, tx);
    if (!channel) {
      const none = await this.priService.findByNameNotNull(DEFAULT_PRIORITY_NAME);
      const append: ChannelAppendWithInfo = { priorityId: none.id, isFollowed: false };
      channel = await this.chWriter.createWithInfo(append, req.channelInfo, tx);
    }

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
        disabled = await this.liveWriter.createByLive(liveInfo, null, null, true, tx);
      }
      this.printLiveLog(headMessage, disabled, null);
      return disabled;
    }

    // If the live is inaccessible, do nothing
    const pfName = channel.platform.name;
    let useCred = liveInfo.isAdult;
    if (req.criterion?.enforceCreds) {
      useCred = true;
    }
    const streamInfo = await this.stlink.fetchStreamInfo(pfName, channel.pid, useCred);
    if (!streamInfo) {
      const { pid, username } = channel;
      log.debug('This live is inaccessible', { platform: pfName, pid, username });
      return null;
    }

    // Create a live
    return tx.transaction(async (txx) => {
      let logMsg = 'New live';
      if (live) {
        if (live && req.failedNode) {
          await this.liveWriter.unbind(live.id, req.failedNode.id, txx);
        }
        if (live && node) {
          await this.liveWriter.bind(live.id, node.id, txx);
        }
        logMsg = 'Update node in live';
      } else {
        live = await this.liveWriter.createByLive(liveInfo, streamInfo, node?.id ?? null, node === null, txx);
      }

      if (node) {
        await this.nodeUpdater.setLastAssignedAtNow(node.id, txx);
        if (!(await this.stdlRedis.get(live.id))) {
          await this.stdlRedis.setLiveDto(live);
        }
        await this.stdl.startRecording(node.endpoint, live.id);
      }

      if (live.channel.priority.shouldNotify) {
        this.notifier.sendLiveInfo(this.env.untf.topic, live);
      }

      this.printLiveLog(logMsg, live, node);
      return live;
    });
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

  private printLiveLog(message: string, live: LiveDto, node: NodeDtoWithLives | null) {
    const attr: CreatedLiveLogAttr = {
      liveId: live.id,
      platform: live.platform.name,
      channelId: live.channel.pid,
      channelName: live.channel.username,
      title: live.liveTitle,
    };
    if (node) {
      attr.node = node.name;
      if (node.lives) {
        attr.assigned = node.lives.length;
      }
    }
    log.info(message, attr);
  }

  async deregister(recordId: string, deleteOpts: DeleteOptions = {}, tx: Tx = db) {
    const exitCmd = deleteOpts.exitCmd ?? 'delete';
    const isPurge = deleteOpts.isPurge ?? false;

    const live = await this.liveFinder.findById(recordId, { nodes: true }, tx);
    if (!live) throw NotFoundError.from('LiveRecord', 'id', recordId);

    if (!isPurge) {
      // soft delete
      if (live.isDisabled) throw new ConflictError(`Already removed live: ${recordId}`);
      await this.liveWriter.disable(live.id, tx);
    } else {
      // hard delete
      await this.liveWriter.delete(recordId, tx);
    }

    if (exitCmd !== 'delete') {
      assert(live.nodes);
      await this.dispatcher.finishLive(live, live.nodes, exitCmd);
    }
    const msg = deleteOpts.msg ?? 'Delete Live';
    log.info(`${msg}: ${exitCmd}`, {
      platform: live.platform.name,
      channelId: live.channel.pid,
      channelName: live.channel.username,
    });

    return live;
  }
}
