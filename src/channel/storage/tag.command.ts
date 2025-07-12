import { db } from '../../infra/db/db.js';
import { channelTagMapTable, channelTagTable } from '../../infra/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
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
} from '../spec/tag.entity.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { z } from 'zod';

const tagEntAppendReq = tagEnt.partial({ description: true, updatedAt: true });
type TagEntAppendRequest = z.infer<typeof tagEntAppendReq>;

@Injectable()
export class TagCommandRepository {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  private appendReq(append: TagEntAppend): TagEntAppendRequest {
    return tagEntAppendReq.parse({
      ...append,
      id: append.id ?? uuid(),
      createdAt: new Date(),
      updatedAt: null,
    });
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
