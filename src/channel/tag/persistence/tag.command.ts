import { db } from '../../../infra/db/db.js';
import { channelTagMapTable, channelTagTable } from '../../../infra/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull } from '../../../utils/list.js';
import { uuid } from '../../../utils/uuid.js';
import { Tx } from '../../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from './tag.query.js';
import {
  ChannelsToTagsEnt,
  channelsToTagsEnt,
  ChannelsToTagsEntAppend,
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
    const id = append.id ?? uuid();
    const req: TagEntAppendRequest = {
      ...append,
      id,
      createdAt: new Date(),
      updatedAt: null,
    };
    const ent = await tx.insert(channelTagTable).values(tagEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async update(update: TagEntUpdate, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.tagQuery.findById(update.tagId, tx);
    if (!tag) throw new NotFoundError('Tag not found');
    const req: TagEnt = { ...tag, ...update.form, updatedAt: new Date() };
    const ent = await tx
      .update(channelTagTable)
      .set(tagEnt.parse(req))
      .where(eq(channelTagTable.id, update.tagId))
      .returning();
    return oneNotNull(ent);
  }

  async delete(tagId: string, tx: Tx = db) {
    await tx.delete(channelTagTable).where(eq(channelTagTable.id, tagId));
  }

  async bind(append: ChannelsToTagsEntAppend, tx: Tx = db) {
    const ent: ChannelsToTagsEnt = { ...append, createdAt: new Date() };
    return tx.insert(channelTagMapTable).values(channelsToTagsEnt.parse(ent));
  }

  async unbind(channelId: string, tagId: string, tx: Tx = db) {
    const cond = and(
      eq(channelTagMapTable.channelId, channelId),
      eq(channelTagMapTable.tagId, tagId),
    );
    await tx.delete(channelTagMapTable).where(cond);
  }
}
