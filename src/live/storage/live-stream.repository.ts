import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, notExists, sql } from 'drizzle-orm';
import { LiveStreamEnt, liveStreamEnt, LiveStreamEntAppend, LiveStreamEntUpdate } from '../spec/live.entity.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channelPriorityTable, channelTable, liveStreamTable, platformTable } from '../../infra/db/schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

const liveStreamEntAppendReq = liveStreamEnt.partial({ id: true });
type LiveStreamEntAppendRequest = z.infer<typeof liveStreamEntAppendReq>;

export interface LiveStreamQuery {
  sourceId: string;
  channelId: string;
}

@Injectable()
export class LiveStreamRepository {
  async create(append: LiveStreamEntAppend, tx: Tx = db) {
    const now = new Date();
    const req: LiveStreamEntAppendRequest = {
      ...append,
      id: append.id,
      createdAt: append.createdAt ?? now,
      updatedAt: append.updatedAt ?? now,
      checkedAt: append.checkedAt ?? now,
    };
    const ent = await tx.insert(liveStreamTable).values(liveStreamEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(liveStreamTable).where(eq(liveStreamTable.id, id));
  }

  findAll(tx: Tx = db) {
    return tx.select().from(liveStreamTable).orderBy(asc(liveStreamTable.createdAt));
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(liveStreamTable).where(eq(liveStreamTable.id, id)));
  }

  async findByLiveAndChannel(query: LiveStreamQuery, tx: Tx = db) {
    return tx
      .select()
      .from(liveStreamTable)
      .where(and(eq(liveStreamTable.sourceId, query.sourceId), eq(liveStreamTable.channelId, query.channelId)))
      .orderBy(desc(liveStreamTable.createdAt));
  }

  async findChannelsForCheckStream(platformName: PlatformName, limit: number, tx: Tx = db) {
    const subQuery = db.select().from(liveStreamTable).where(eq(liveStreamTable.channelId, channelTable.id));
    const res = await tx
      .select({ channels: channelTable })
      .from(channelTable)
      .innerJoin(platformTable, eq(channelTable.platformId, platformTable.id))
      .innerJoin(channelPriorityTable, eq(channelTable.priorityId, channelPriorityTable.id))
      .where(and(eq(platformTable.name, platformName), eq(channelPriorityTable.shouldSave, true), notExists(subQuery)))
      .orderBy(sql`${channelTable.streamCheckedAt} ASC NULLS FIRST`)
      .limit(limit);
    return res.map((row) => row.channels);
  }

  async update(id: string, update: LiveStreamEntUpdate, tx: Tx = db) {
    const liveStream = await this.findById(id, tx);
    if (!liveStream) {
      throw NotFoundError.from('LiveStream', 'id', id);
    }
    const entReq: LiveStreamEnt = {
      ...liveStream,
      ...update,
      updatedAt: new Date(),
    };
    const ent = await tx
      .update(liveStreamTable)
      .set(liveStreamEnt.parse(entReq))
      .where(eq(liveStreamTable.id, id))
      .returning();
    return oneNotNull(ent);
  }

  async findEarliestChecked(limit: number, tx: Tx = db): Promise<LiveStreamEnt[]> {
    return tx.select().from(liveStreamTable).orderBy(asc(liveStreamTable.checkedAt)).limit(limit);
  }
}
