import { LiveRepository } from '../storage/live.repository.js';
import { Inject, Injectable } from '@nestjs/common';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveEntAppend } from '../spec/live.entity.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveMapper } from './live.mapper.js';
import { LiveDto, LiveStreamDto, LiveUpdate } from '../spec/live.dto.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { getFormattedTimestamp } from '../../utils/time.js';
import { LiveNodeRepository } from '../../node/storage/live-node.repository.js';
import { LiveFinder } from './live.finder.js';
import assert from 'assert';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NodeRepository } from '../../node/storage/node.repository.js';
import { LiveStreamService } from './live-stream.service.js';

export interface LiveCreationFields {
  channelId: string;
  isDisabled: boolean;
  domesticOnly: boolean;
  overseasFirst: boolean;
  liveStreamId: string | null;
  videoName?: string;
}

export interface LiveCreateArgs {
  liveInfo: LiveInfo;
  fields: LiveCreationFields;
}

@Injectable()
export class LiveWriter {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly liveRepo: LiveRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly liveFinder: LiveFinder,
    private readonly liveStreamService: LiveStreamService,
    private readonly channelFinder: ChannelFinder,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly nodeRepo: NodeRepository,
    private readonly mapper: LiveMapper,
  ) {}

  async createByLive(baseId: string, tx: Tx = db): Promise<LiveDto> {
    const baseEnt = await this.liveRepo.findById(baseId, tx);
    if (!baseEnt) throw NotFoundError.from('Live', 'id', baseId);

    const req: LiveEntAppend = {
      ...baseEnt,
      status: 'initializing',
      isDisabled: false,
      videoName: getFormattedTimestamp(),
    };
    delete req.id;
    delete req.createdAt;
    delete req.updatedAt;
    delete req.deletedAt;

    const ent = await this.liveRepo.create(req, tx);
    return await this.mapper.map(ent);
  }

  async createByLiveInfo(args: LiveCreateArgs, tx: Tx = db): Promise<LiveDto> {
    const liveInfo = args.liveInfo;
    const platform = await this.pfFinder.findByNameNotNull(liveInfo.type, tx);
    const channel = await this.channelFinder.findByPidAndPlatform(liveInfo.pid, platform.name, tx);
    if (!channel) throw NotFoundError.from('Channel', 'pid', liveInfo.pid);
    let stream: LiveStreamDto | null = null;
    if (args.fields.liveStreamId) {
      stream = await this.liveStreamService.findById(args.fields.liveStreamId, tx);
    }

    // Validate videoName
    let videoName = args.fields.videoName;
    if (!videoName) {
      videoName = getFormattedTimestamp();
    }
    for (const live of await this.liveFinder.findByPid(channel.pid)) {
      if (live.videoName === videoName) {
        throw new ConflictError('A live stream with the same video name is already running on this channel');
      }
    }

    const req: LiveEntAppend = {
      ...liveInfo,
      ...args.fields,
      platformId: platform.id,
      channelId: channel.id,
      sourceId: args.liveInfo.liveId,
      liveDetails: null,
      videoName,
      fsName: this.env.fsName,
      status: 'initializing',
    };
    const ent = await this.liveRepo.create(req, tx);

    return { ...ent, channel, platform, stream };
  }

  async bind(req: { liveId: string; nodeId: string }, tx: Tx = db) {
    const { liveId, nodeId } = req;
    await this.liveNodeRepo.create({ liveId, nodeId }, tx);
    // For performance and deadlock prevention
    return db.transaction(async (txx) => {
      const node = await this.nodeRepo.findById(nodeId, txx);
      if (!node) throw NotFoundError.from('Node', 'id', nodeId);
      await this.nodeRepo.update(nodeId, { livesCnt: node.livesCnt + 1 }, txx);
    });
  }

  async unbind(req: { liveId: string; nodeId: string }, tx: Tx = db) {
    const { liveId, nodeId } = req;
    await this.liveNodeRepo.delete({ liveId, nodeId }, tx);
    // For performance and deadlock prevention
    await db.transaction(async (txx) => {
      const node = await this.nodeRepo.findById(nodeId, txx);
      if (!node) throw NotFoundError.from('Node', 'id', nodeId);
      await this.nodeRepo.update(nodeId, { livesCnt: node.livesCnt - 1 }, txx);
    });
  }

  private async hardDelete(liveId: string, tx: Tx = db) {
    const live = await this.liveFinder.findById(liveId, { nodes: true }, tx);
    if (!live) throw NotFoundError.from('Live', 'id', liveId);

    return tx.transaction(async (txx) => {
      assert(live.nodes);
      for (const node of live.nodes) {
        await this.unbind({ liveId, nodeId: node.id }, txx);
      }
      await this.liveRepo.delete(liveId, txx);
      if (live.stream) {
        const lives = await this.liveRepo.findByStreamId(live.stream.id, txx);
        if (lives.length === 0) {
          await this.liveStreamService.delete(live.stream.id, txx); // TODO: remove
        }
      }
      return live;
    });
  }

  async updateByLive(id: string, live: LiveInfo, tx: Tx = db) {
    return this.update(id, { ...live }, tx);
  }

  async delete(liveId: string, isPurge: boolean, finished: boolean, tx: Tx = db) {
    if (isPurge) {
      // hard delete
      return this.hardDelete(liveId, tx);
    } else {
      // softly delete
      return this.disable(liveId, true, finished, tx);
    }
  }

  async disable(liveId: string, withLives: boolean, finished: boolean, tx: Tx = db) {
    const live = await this.liveFinder.findById(liveId, { nodes: withLives }, tx);
    if (!live) throw NotFoundError.from('Live', 'id', liveId);

    return tx.transaction(async (txx) => {
      if (live.nodes) {
        for (const node of live.nodes) {
          await this.unbind({ liveId, nodeId: node.id }, txx);
        }
      }
      const update: LiveUpdate = { isDisabled: true };
      if (finished) {
        update.deletedAt = new Date();
      }
      await this.update(liveId, update, txx);
      return live;
    });
  }

  async update(id: string, update: LiveUpdate, tx: Tx = db) {
    const updated = await this.liveRepo.update(id, update, tx);
    return this.mapper.map(updated, tx);
  }
}
