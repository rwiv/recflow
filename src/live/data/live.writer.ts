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
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { nodeAttr } from '../../common/attr/attr.live.js';
import { LiveStreamService } from './live-stream.service.js';

export interface LiveCreateOptions {
  isDisabled: boolean;
  domesticOnly: boolean;
  overseasFirst: boolean;
  videoName?: string;
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

  async createByLive(
    live: LiveInfo,
    stream: LiveStreamDto | null,
    opts: LiveCreateOptions,
    tx: Tx = db,
  ): Promise<LiveDto> {
    const platform = await this.pfFinder.findByNameNotNull(live.type, tx);
    const channel = await this.channelFinder.findByPidAndPlatform(live.pid, platform.name, tx);
    if (!channel) throw NotFoundError.from('Channel', 'pid', live.pid);

    // Validate videoName
    let videoName = opts.videoName;
    if (!videoName) {
      videoName = getFormattedTimestamp();
    }
    for (const live of await this.liveFinder.findByPid(channel.pid)) {
      if (live.videoName === videoName) {
        throw new ConflictError('A live stream with the same video name is already running on this channel');
      }
    }

    const req: LiveEntAppend = {
      ...live,
      ...opts,
      platformId: platform.id,
      channelId: channel.id,
      sourceId: live.liveId,
      liveDetails: null,
      videoName,
      liveStreamId: stream?.id ?? null,
      fsName: this.env.fsName,
    };
    const ent = await this.liveRepo.create(req, tx);

    return { ...ent, channel, platform, stream };
  }

  async bind(liveId: string, nodeId: string) {
    // To prevent deadlock
    return db.transaction(async (txx) => {
      const node = await this.nodeRepo.findByIdForUpdate(nodeId, txx);
      if (!node) throw NotFoundError.from('Node', 'id', nodeId);
      await this.liveNodeRepo.create({ liveId, nodeId }, txx);
      await this.nodeRepo.update(nodeId, { livesCnt: node.livesCnt + 1 }, txx);
    });
  }

  async unbind(req: { liveId: string; nodeId: string }) {
    // To prevent deadlock
    return db.transaction(async (txx) => {
      const { liveId, nodeId } = req;
      const node = await this.nodeRepo.findByIdForUpdate(nodeId, txx);
      if (!node) throw NotFoundError.from('Node', 'id', nodeId);
      if (node.livesCnt === 0) {
        throw new ValidationError('No active live streams are bound to this node to unbind.', { attr: nodeAttr(node) });
      }
      await this.liveNodeRepo.delete({ liveId, nodeId }, txx);
      await this.nodeRepo.update(nodeId, { livesCnt: node.livesCnt - 1 }, txx);
    });
  }

  private async hardDelete(liveId: string, tx: Tx = db) {
    const live = await this.liveFinder.findById(liveId, { nodes: true }, tx);
    if (!live) throw NotFoundError.from('Live', 'id', liveId);

    return tx.transaction(async (txx) => {
      assert(live.nodes);
      for (const node of live.nodes) {
        await this.unbind({ liveId, nodeId: node.id });
      }
      await this.liveRepo.delete(liveId, txx);
      if (live.stream) {
        await this.liveStreamService.delete(live.stream.id, txx); // TODO: remove
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
          await this.unbind({ liveId, nodeId: node.id });
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
