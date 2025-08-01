import { db } from '../../infra/db/db.js';
import { channelTagMapTable, channelTable } from '../../infra/db/schema.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { oneNullable } from '../../utils/list.js';
import { ChannelEnt } from '../spec/channel.entity.schema.js';

@Injectable()
export class ChannelQueryRepository {
  findAll(tx: Tx = db) {
    return tx.select().from(channelTable);
  }

  async findById(channelId: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(channelTable).where(eq(channelTable.id, channelId)));
  }

  async findBySourceId(sourceId: string, tx: Tx = db) {
    return tx.select().from(channelTable).where(eq(channelTable.sourceId, sourceId));
  }

  async findByPlatformAndSourceId(platformId: string, sourceId: string, tx: Tx = db) {
    return tx
      .select()
      .from(channelTable)
      .where(and(eq(channelTable.sourceId, sourceId), eq(channelTable.platformId, platformId)));
  }

  async findByUsernameLike(username: string, tx: Tx = db) {
    return tx
      .select()
      .from(channelTable)
      .where(like(channelTable.username, `%${username}%`));
  }

  async findByPriorityId(priorityId: string, tx: Tx = db) {
    return tx.select().from(channelTable).where(eq(channelTable.priorityId, priorityId));
  }

  async findIdsByPriorityId(priorityId: string, tx: Tx = db) {
    const records = await tx
      .select({ id: channelTable.id })
      .from(channelTable)
      .where(eq(channelTable.priorityId, priorityId));
    return records.map((record) => record.id);
  }

  async findIdsByFollowedFlag(isFollowed: boolean, tx: Tx = db): Promise<string[]> {
    const rows = await tx
      .select({ id: channelTable.id })
      .from(channelTable)
      .where(and(eq(channelTable.isFollowed, isFollowed)));
    return rows.map((row) => row.id);
  }

  async findByTagId(tagId: string, limit: number, tx: Tx = db): Promise<ChannelEnt[]> {
    const rows = await tx
      .select()
      .from(channelTagMapTable)
      .innerJoin(channelTable, eq(channelTagMapTable.channelId, channelTable.id))
      .where(eq(channelTagMapTable.tagId, tagId))
      .limit(limit);
    return rows.map((row) => row.channel).filter((tag) => tag !== null);
  }

  async findEarliestRefreshed(limit: number, tx: Tx = db): Promise<ChannelEnt[]> {
    return tx
      .select()
      .from(channelTable)
      .orderBy(sql`${channelTable.lastRefreshedAt} ASC NULLS FIRST`)
      .limit(limit);
  }
}
