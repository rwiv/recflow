import { db } from '../../../infra/db/db.js';
import { channelsToTags, channelTags } from '../../../infra/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull } from '../../../utils/list.js';
import { uuid } from '../../../utils/uuid.js';
import { Tx } from '../../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from './tag.query.js';
import {
  ChannelsToTagsEnt,
  channelsToTagsEnt,
  TagEnt,
  tagEnt,
  TagEntAppend,
  TagEntUpdate,
} from './tag.persistence.schema.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { ConflictError } from '../../../utils/errors/errors/ConflictError.js';
import { z } from 'zod';

const tagEntAppendReq = tagEnt.partial({ description: true, updatedAt: true });
type TagEntAppendRequest = z.infer<typeof tagEntAppendReq>;

@Injectable()
export class TagCommandRepository {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  async create(append: TagEntAppend, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.tagQuery.findByName(append.name, tx);
    if (tag) throw new ConflictError('Tag already exists');
    const entReq: TagEntAppendRequest = {
      ...append,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    const ent = await tx.insert(channelTags).values(tagEntAppendReq.parse(entReq)).returning();
    return oneNotNull(ent);
  }

  async update(update: TagEntUpdate, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.tagQuery.findById(update.tagId, tx);
    if (!tag) throw new NotFoundError('Tag not found');
    const entReq: TagEnt = { ...tag, ...update.form, updatedAt: new Date() };
    const ent = await tx
      .update(channelTags)
      .set(tagEnt.parse(entReq))
      .where(eq(channelTags.id, update.tagId))
      .returning();
    return oneNotNull(ent);
  }

  async delete(tagId: string, tx: Tx = db) {
    await tx.delete(channelTags).where(eq(channelTags.id, tagId));
  }

  async bind(channelId: string, tagId: string, tx: Tx = db) {
    const ent: ChannelsToTagsEnt = { channelId, tagId, createdAt: new Date() };
    return tx.insert(channelsToTags).values(channelsToTagsEnt.parse(ent));
  }

  async unbind(channelId: string, tagId: string, tx: Tx = db) {
    const cond = and(eq(channelsToTags.channelId, channelId), eq(channelsToTags.tagId, tagId));
    await tx.delete(channelsToTags).where(cond);
  }
}
