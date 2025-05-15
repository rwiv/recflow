import { LiveRepository } from '../storage/live.repository.js';
import { Inject, Injectable } from '@nestjs/common';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveEntAppend } from '../spec/live.entity.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveMapper } from './live.mapper.js';
import { LiveDto, LiveUpdate } from '../spec/live.dto.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { getFormattedTimestamp } from '../../utils/time.js';
import { LiveNodeRepository } from '../../node/storage/live-node.repository.js';
import { LiveFinder } from './live.finder.js';
import assert from 'assert';
import { StreamInfo } from '../../platform/stlink/stlink.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';

export interface LiveCreateOptions {
  isDisabled: boolean;
  domesticOnly: boolean;
  overseasFirst: boolean;
}

@Injectable()
export class LiveWriter {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly liveRepo: LiveRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly liveFinder: LiveFinder,
    private readonly channelFinder: ChannelFinder,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly mapper: LiveMapper,
  ) {}

  async createByLive(
    live: LiveInfo,
    streamInfo: StreamInfo | null,
    opts: LiveCreateOptions,
    tx: Tx = db,
  ): Promise<LiveDto> {
    const platform = await this.pfFinder.findByNameNotNull(live.type, tx);
    const channel = await this.channelFinder.findByPidAndPlatform(live.pid, platform.name, {}, tx);
    if (!channel) throw NotFoundError.from('Channel', 'pid', live.pid);

    return tx.transaction(async (tx) => {
      const req: LiveEntAppend = {
        ...live,
        ...opts,
        platformId: platform.id,
        channelId: channel.id,
        sourceId: live.liveId,
        videoName: getFormattedTimestamp(),
        streamUrl: streamInfo?.best?.mediaPlaylistUrl ?? null,
        headers: streamInfo?.headers ? JSON.stringify(streamInfo.headers) : null,
        fsName: this.env.fsName,
      };
      const ent = await this.liveRepo.create(req, tx);

      return { ...ent, channel, platform, headers: streamInfo?.headers ?? null };
    });
  }

  async bind(liveId: string, nodeId: string, tx: Tx = db) {
    await this.liveNodeRepo.create({ liveId, nodeId }, tx);
  }

  async unbind(liveId: string, nodeId: string, tx: Tx = db) {
    await this.liveNodeRepo.delete({ liveId, nodeId }, tx);
  }

  private async hardDelete(liveId: string, tx: Tx = db) {
    const live = await this.liveFinder.findById(liveId, { nodes: true }, tx);
    if (!live) throw NotFoundError.from('Live', 'id', liveId);

    return tx.transaction(async (tx) => {
      assert(live.nodes);
      for (const node of live.nodes) {
        await this.liveNodeRepo.delete({ liveId, nodeId: node.id });
      }
      await this.liveRepo.delete(liveId, tx);
      return live;
    });
  }

  async updateByLive(id: string, live: LiveInfo, tx: Tx = db) {
    return this.update(id, { ...live }, tx);
  }

  async delete(liveId: string, removeLives: boolean, isPurge: boolean, tx: Tx = db) {
    if (isPurge) {
      // hard delete
      return this.hardDelete(liveId, tx);
    } else {
      // soft delete
      return this.disable(liveId, removeLives, tx);
    }
  }

  async disable(liveId: string, removeLives: boolean, tx: Tx = db) {
    const live = await this.liveFinder.findById(liveId, { nodes: removeLives }, tx);
    if (!live) throw NotFoundError.from('Live', 'id', liveId);

    return tx.transaction(async (txx) => {
      if (live.nodes) {
        for (const node of live.nodes) {
          await this.liveNodeRepo.delete({ liveId, nodeId: node.id }, txx);
        }
      }
      await this.update(liveId, { isDisabled: true, deletedAt: new Date() }, txx);
      return live;
    });
  }

  async update(id: string, update: LiveUpdate, tx: Tx = db) {
    const updated = await this.liveRepo.update(id, update, tx);
    return this.mapper.map(updated, tx);
  }
}
