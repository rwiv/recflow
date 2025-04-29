import { LiveRepository } from '../storage/live.repository.js';
import { Injectable } from '@nestjs/common';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveEntAppend } from '../spec/live.entity.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveMapper } from './live.mapper.js';
import { LiveDto, LiveUpdate } from '../spec/live.dto.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { getFormattedTimestamp } from '../../utils/time.js';
import { LiveNodeRepository } from '../../node/storage/live-node.repository.js';
import { LiveFinder } from './live.finder.js';
import assert from 'assert';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

@Injectable()
export class LiveWriter {
  constructor(
    private readonly liveRepo: LiveRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly liveFinder: LiveFinder,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly mapper: LiveMapper,
  ) {}

  async createByLive(
    live: LiveInfo,
    nodeId: string | null,
    isDisabled: boolean,
    tx: Tx = db,
  ): Promise<LiveDto> {
    const platform = await this.pfFinder.findByNameNotNull(live.type, tx);
    const channel = await this.channelFinder.findByPidAndPlatform(live.pid, platform.name, false, tx);
    if (channel === undefined) throw NotFoundError.from('Channel', 'pid', live.pid);

    if (await this.liveRepo.findByPlatformAndSourceId(platform.id, live.liveId)) {
      throw new ValidationError(`Duplicated live, channel=${channel.username}`);
    }

    let node: NodeDto | null | undefined = null;
    if (nodeId) {
      node = await this.nodeFinder.findById(nodeId, { group: false, lives: false }, tx);
      if (!node) throw NotFoundError.from('Node', 'id', nodeId);
    }

    return tx.transaction(async (tx) => {
      const req: LiveEntAppend = {
        ...live,
        platformId: platform.id,
        channelId: channel.id,
        sourceId: live.liveId,
        videoName: getFormattedTimestamp(),
        isDisabled,
      };
      const ent = await this.liveRepo.create(req, tx);

      if (node) {
        await this.liveNodeRepo.create({ liveId: ent.id, nodeId: node.id }, tx);
      }

      return { ...ent, channel, platform, node };
    });
  }

  async bind(liveId: string, nodeId: string, tx: Tx = db) {
    await this.liveNodeRepo.create({ liveId, nodeId }, tx);
  }

  async unbind(liveId: string, nodeId: string, tx: Tx = db) {
    await this.liveNodeRepo.delete({ liveId, nodeId }, tx);
  }

  async delete(liveId: string, tx: Tx = db) {
    const live = await this.liveFinder.findById(liveId, { nodes: true }, tx);
    if (!live) throw NotFoundError.from('Live', 'id', liveId);

    return tx.transaction(async (tx) => {
      assert(live.nodes);
      for (const node of live.nodes) {
        await this.liveNodeRepo.delete({ liveId, nodeId: node.id });
      }
      return this.liveRepo.delete(liveId, tx);
    });
  }

  async updateByLive(id: string, live: LiveInfo, tx: Tx = db) {
    const update: LiveUpdate = { ...live };
    if (!live.streamUrl) {
      delete update.streamUrl;
    }
    return this.update(id, update, tx);
  }

  async disable(liveId: string, tx: Tx = db) {
    const live = await this.liveFinder.findById(liveId, { nodes: true }, tx);
    if (!live) throw NotFoundError.from('Live', 'id', liveId);

    return tx.transaction(async (tx) => {
      assert(live.nodes);
      for (const node of live.nodes) {
        await this.liveNodeRepo.delete({ liveId, nodeId: node.id });
      }

      const update: LiveUpdate = { isDisabled: true, deletedAt: new Date() };
      await this.update(liveId, update, tx);
    });
  }

  async update(id: string, update: LiveUpdate, tx: Tx = db) {
    const updated = await this.liveRepo.update(id, update, tx);
    return this.mapper.map(updated, tx);
  }
}
