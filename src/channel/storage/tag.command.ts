import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { ConflictError } from '@/utils/errors/errors/ConflictError.js';
import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { oneNotNull } from '@/utils/list.js';

import { db } from '@/infra/db/db.js';
import { channelTagMapTable, channelTagTable } from '@/infra/db/schema.js';
import { Tx } from '@/infra/db/types.js';

import {
  ChannelsToTagsEnt,
  ChannelsToTagsEntAppend,
  TagEnt,
  TagEntAppend,
  TagEntUpdate,
  channelsToTagsEnt,
  tagEnt,
} from '@/channel/spec/tag.entity.schema.js';
import { TagQueryRepository } from '@/channel/storage/tag.query.js';

const tagEntAppendReq = tagEnt.partial({ id: true, description: true, updatedAt: true });
type TagEntAppendRequest = z.infer<typeof tagEntAppendReq>;

@Injectable()
export class TagCommandRepository {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  private appendReq(append: TagEntAppend): TagEntAppendRequest {
    const req: TagEntAppendRequest = {
      ...append,
      id: append.id,
      createdAt: new Date(),
      updatedAt: null,
    };
    return tagEntAppendReq.parse(req);
  }

  async create(append: TagEntAppend, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.tagQuery.findByName(append.name, tx);
    if (tag) throw new ConflictError('Tag already exists');
    const ent = await tx.insert(channelTagTable).values(this.appendReq(append)).returning();
    return oneNotNull(ent);
  }

  async createBatch(appends: TagEntAppend[], tx: Tx = db): Promise<string[]> {
    const reqs = appends.map((append) => this.appendReq(append));
    return (await tx.insert(channelTagTable).values(reqs).returning({ id: channelTagTable.id })).map((it) => it.id);
  }

  async update(id: string, update: TagEntUpdate, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.tagQuery.findById(id, tx);
    if (!tag) throw NotFoundError.from('ChannelTag', 'id', id);
    const req: TagEnt = {
      ...tag,
      ...update,
      updatedAt: new Date(),
    };
    const ent = await tx.update(channelTagTable).set(tagEnt.parse(req)).where(eq(channelTagTable.id, id)).returning();
    return oneNotNull(ent);
  }

  async delete(tagId: string, tx: Tx = db) {
    await tx.delete(channelTagTable).where(eq(channelTagTable.id, tagId));
  }

  private bindReq(append: ChannelsToTagsEntAppend): ChannelsToTagsEnt {
    return channelsToTagsEnt.parse({ ...append, createdAt: new Date() });
  }

  async bind(append: ChannelsToTagsEntAppend, tx: Tx = db) {
    return tx.insert(channelTagMapTable).values(this.bindReq(append));
  }

  async bindBatch(appends: ChannelsToTagsEntAppend[], tx: Tx = db) {
    const reqs: ChannelsToTagsEnt[] = appends.map((append) => this.bindReq(append));
    return tx.insert(channelTagMapTable).values(reqs);
  }

  async unbind(channelId: string, tagId: string, tx: Tx = db) {
    const cond = and(eq(channelTagMapTable.channelId, channelId), eq(channelTagMapTable.tagId, tagId));
    await tx.delete(channelTagMapTable).where(cond);
  }
}
