import { TagCommandRepository } from '../persistence/tag.command.repository.js';
import {
  TagEnt,
  TagEntAttachment,
  TagEntDetachment,
  TagEntUpdate,
} from '../persistence/tag.types.js';
import { TagRecord } from './tag.types.js';
import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from '../persistence/tag.query.repository.js';
import { channelsToTags, tags } from '../persistence/schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { processSets } from '../../utils/set.js';
import { assertNotNull } from '../../utils/null.js';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class TagWriter {
  constructor(
    private readonly tagCmd: TagCommandRepository,
    private readonly tagQuery: TagQueryRepository,
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
      const tbc = { channelId: req.channelId, tagId: tag.id, createdAt: new Date() };
      await txx.insert(channelsToTags).values(tbc);
      return tag;
    });
  }

  detach(req: TagEntDetachment, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const cond = and(
        eq(channelsToTags.channelId, req.channelId),
        eq(channelsToTags.tagId, req.tagId),
      );
      await txx.delete(channelsToTags).where(cond);
      if ((await this.tagQuery.findChannelsByTagId(req.tagId, 1, txx)).length === 0) {
        await txx.delete(tags).where(eq(tags.id, req.tagId));
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
