import { oneNotNull } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channelTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from './channel.query.js';
import { ChannelEnt, channelEnt, ChannelEntAppend, ChannelEntUpdate } from '../spec/channel.entity.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { z } from 'zod';

const channelEntAppendReq = channelEnt.partial({
  id: true,
  profileImgUrl: true,
  description: true,
  lastRefreshedAt: true,
});
type ChannelEntAppendRequest = z.infer<typeof channelEntAppendReq>;

@Injectable()
export class ChannelCommandRepository {
  constructor(private readonly chQuery: ChannelQueryRepository) {}

  private appendReq(append: ChannelEntAppend): ChannelEntAppendRequest {
    const req: ChannelEntAppendRequest = {
      ...append,
      id: append.id,
      overseasFirst: append.overseasFirst ?? false,
      adultOnly: append.adultOnly ?? false,
      createdAt: append.createdAt ?? new Date(),
      updatedAt: append.updatedAt ?? new Date(),
    };
    return channelEntAppendReq.parse(req);
  }

  async create(append: ChannelEntAppend, tx: Tx = db): Promise<ChannelEnt> {
    const ent = await tx.insert(channelTable).values(this.appendReq(append)).returning();
    return oneNotNull(ent);
  }

  async createBatch(appends: ChannelEntAppend[], tx: Tx = db): Promise<string[]> {
    const reqs: ChannelEntAppendRequest[] = appends.map((append) => this.appendReq(append));
    return (await tx.insert(channelTable).values(reqs).returning({ id: channelTable.id })).map((it) => it.id);
  }

  async setUpdatedAtNow(id: string, tx: Tx = db) {
    return this.update(id, {}, false, tx);
  }

  async update(id: string, update: ChannelEntUpdate, isRefresh: boolean, tx: Tx = db): Promise<ChannelEnt> {
    const channel = await this.chQuery.findById(id, tx);
    if (!channel) throw NotFoundError.from('Channel', 'id', id);
    const req: ChannelEnt = {
      ...channel,
      ...update,
    };
    if (isRefresh) {
      req.lastRefreshedAt = new Date();
    } else {
      req.updatedAt = new Date();
    }
    const ent = await tx.update(channelTable).set(channelEnt.parse(req)).where(eq(channelTable.id, id)).returning();
    return oneNotNull(ent);
  }

  async delete(channelId: string, tx: Tx = db) {
    await tx.delete(channelTable).where(eq(channelTable.id, channelId));
  }
}
