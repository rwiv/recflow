import { db } from '../../infra/db/db.js';
import { channelsToTags, tags } from '../../infra/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { TagEntCreation, TagEnt, TagEntUpdate } from './tag.types.js';
import { TagQueryRepository } from './tag.query.js';

@Injectable()
export class TagCommandRepository {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  async create(req: TagEntCreation, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.tagQuery.findByName(req.name, tx);
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
    const tag = await this.tagQuery.findById(req.tagId, tx);
    if (!tag) throw new Error('Tag not found');
    const tbu = {
      ...tag,
      ...req.form,
      updatedAt: new Date(),
    };
    return oneNotNull(await tx.update(tags).set(tbu).where(eq(tags.id, req.tagId)).returning());
  }

  async delete(tagId: string, tx: Tx = db) {
    await tx.delete(tags).where(eq(tags.id, tagId));
  }

  async bind(channelId: string, tagId: string, tx: Tx = db) {
    return tx.insert(channelsToTags).values({ channelId, tagId, createdAt: new Date() });
  }

  async unbind(channelId: string, tagId: string, tx: Tx = db) {
    const cond = and(eq(channelsToTags.channelId, channelId), eq(channelsToTags.tagId, tagId));
    await tx.delete(channelsToTags).where(cond);
  }
}
