import { db } from '../../infra/db/db.js';
import { channelsToTags, tags } from './schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
import { processSets } from '../../utils/set.js';
import { assertNotNull } from '../../utils/null.js';
import { Injectable } from '@nestjs/common';
import {
  TagEntAttachment,
  TagEntCreation,
  TagEntDetachment,
  TagEnt,
  TagEntUpdate,
} from './tag.types.js';
import { TagQueryRepository } from './tag.query.repository.js';

@Injectable()
export class TagCommandRepository {
  constructor(private readonly tagQueryRepo: TagQueryRepository) {}

  private async create(req: TagEntCreation, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.tagQueryRepo.findByName(req.name, tx);
    if (tag) throw new Error('Tag already exists');
    const tbc = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(tags).values(tbc).returning());
  }

  async update(req: TagEntUpdate, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.tagQueryRepo.findById(req.tagId, tx);
    if (!tag) throw new Error('Tag not found');
    const tbu = {
      ...tag,
      ...req.form,
      updatedAt: new Date(),
    };
    return oneNotNull(await tx.update(tags).set(tbu).where(eq(tags.id, req.tagId)).returning());
  }

  async attach(req: TagEntAttachment, tx: Tx = db): Promise<TagEnt> {
    return tx.transaction(async (txx) => {
      let tag = await this.tagQueryRepo.findByName(req.tagName, txx);
      if (!tag) {
        tag = await this.create({ name: req.tagName }, txx);
      }
      const tbc = { channelId: req.channelId, tagId: tag.id, createdAt: new Date() };
      await txx.insert(channelsToTags).values(tbc);
      return tag;
    });
  }

  async detach(req: TagEntDetachment, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const cond = and(
        eq(channelsToTags.channelId, req.channelId),
        eq(channelsToTags.tagId, req.tagId),
      );
      await txx.delete(channelsToTags).where(cond);
      if ((await this.tagQueryRepo.findChannelsByTagId(req.tagId, 1, txx)).length === 0) {
        await txx.delete(tags).where(eq(tags.id, req.tagId));
      }
    });
  }

  async applyTags(channelId: string, tagNames: string[], tx: Tx = db): Promise<TagEnt[]> {
    const tags = await this.tagQueryRepo.findTagsByChannelId(channelId, tx);
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
