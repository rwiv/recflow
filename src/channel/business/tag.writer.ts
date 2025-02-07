import { TagCommandRepository } from '../persistence/tag.command.js';
import {
  TagEnt,
  TagEntAttachment,
  TagEntDetachment,
  TagEntUpdate,
} from '../persistence/tag.types.js';
import { TagRecord } from './tag.types.js';
import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { processSets } from '../../utils/set.js';
import { assertNotNull } from '../../utils/null.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';

@Injectable()
export class TagWriter {
  constructor(
    private readonly tagCmd: TagCommandRepository,
    private readonly tagQuery: TagQueryRepository,
    private readonly chQuery: ChannelQueryRepository,
  ) {}

  update(req: TagEntUpdate): Promise<TagRecord> {
    return this.tagCmd.update(req);
  }

  attach(req: TagEntAttachment, tx: Tx = db): Promise<TagRecord> {
    return tx.transaction(async (txx) => {
      let tag = await this.tagQuery.findByName(req.tagName, txx);
      if (!tag) {
        tag = await this.tagCmd.create({ name: req.tagName }, txx);
      }
      await this.tagCmd.bind(req.channelId, tag.id, txx);
      return tag;
    });
  }

  detach(req: TagEntDetachment, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      await this.tagCmd.unbind(req.channelId, req.tagId, txx);
      if ((await this.chQuery.findChannelsByTagId(req.tagId, 1, txx)).length === 0) {
        await this.tagCmd.delete(req.tagId, txx);
      }
    });
  }

  async applyTags(channelId: string, tagNames: string[], tx: Tx = db): Promise<TagEnt[]> {
    const tags = await this.tagQuery.findTagsByChannelId(channelId, tx);
    const setA = new Set(tags.map((tag) => tag.name)); // existing tags
    const mapA = new Map(tags.map((tag) => [tag.name, tag]));
    const setB = new Set(tagNames); // expected tags
    const { intersection, newSetA, newSetB } = processSets(setA, setB);
    return tx.transaction(async (txx) => {
      const result: TagEnt[] = [];
      for (const tagName of intersection) {
        const tag = assertNotNull(mapA.get(tagName));
        result.push(tag);
      }
      for (const tagName of newSetA) {
        const tag = assertNotNull(mapA.get(tagName));
        await this.detach({ channelId, tagId: tag.id }, txx);
      }
      for (const tagName of newSetB) {
        const newTag = await this.attach({ channelId, tagName }, txx);
        result.push(newTag);
      }
      return result;
    });
  }
}
