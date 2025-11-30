import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { oneNotNull } from '@/utils/list.js';

import { db } from '@/infra/db/db.js';
import { channelTable } from '@/infra/db/schema.js';
import { Tx } from '@/infra/db/types.js';

import { ChannelEnt, ChannelEntAppend, ChannelEntUpdate, channelEnt } from '@/channel/spec/channel.entity.schema.js';
import { ChannelQueryRepository } from '@/channel/storage/channel.query.js';

export interface UpdateOptions {
  refresh?: boolean;
  streamCheck?: boolean;
}

const channelEntAppendReq = channelEnt.partial({
  id: true,
  profileImgUrl: true,
  description: true,
  lastRefreshedAt: true,
  streamCheckedAt: true,
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
    return this.update(id, {}, { refresh: false, streamCheck: false }, tx);
  }

  async update(id: string, update: ChannelEntUpdate, opts: UpdateOptions, tx: Tx = db): Promise<ChannelEnt> {
    const channel = await this.chQuery.findById(id, tx);
    if (!channel) throw NotFoundError.from('Channel', 'id', id);
    const req: ChannelEnt = {
      ...channel,
      ...update,
    };
    const now = new Date();
    if (opts.streamCheck) {
      req.streamCheckedAt = now;
    }
    if (opts.refresh) {
      req.lastRefreshedAt = now;
    } else {
      req.updatedAt = now;
    }
    const ent = await tx.update(channelTable).set(channelEnt.parse(req)).where(eq(channelTable.id, id)).returning();
    return oneNotNull(ent);
  }

  async delete(channelId: string, tx: Tx = db) {
    await tx.delete(channelTable).where(eq(channelTable.id, channelId));
  }
}
