import { db } from '../../infra/db/db.js';
import { channelTagMapTable, channelTable, platformTable } from '../../infra/db/schema.js';
import { and, eq, like } from 'drizzle-orm';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { oneNullable } from '../../utils/list.js';
import { ChannelEnt } from './channel.entity.schema.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

@Injectable()
export class ChannelQueryRepository {
  findAll(tx: Tx = db) {
    return tx.select().from(channelTable);
  }

  async findById(channelId: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(channelTable).where(eq(channelTable.id, channelId)));
  }

  async findByPid(pid: string, tx: Tx = db) {
    return tx.select().from(channelTable).where(eq(channelTable.pid, pid));
  }

  async findByPidAndPlatform(pid: string, platformId: string, tx: Tx = db) {
    return tx
      .select()
      .from(channelTable)
      .where(and(eq(channelTable.pid, pid), eq(channelTable.platformId, platformId)));
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

  async findByFollowedFlag(
    followed: boolean,
    platformName: PlatformName,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const rows = await tx
      .select()
      .from(channelTable)
      .innerJoin(platformTable, eq(channelTable.platformId, platformTable.id))
      .where(and(eq(channelTable.followed, followed), eq(platformTable.name, platformName)));
    return rows.map((row) => row.channel);
  }

  async findChannelsByTagId(tagId: string, limit: number, tx: Tx = db): Promise<ChannelEnt[]> {
    const rows = await tx
      .select()
      .from(channelTagMapTable)
      .innerJoin(channelTable, eq(channelTagMapTable.channelId, channelTable.id))
      .where(eq(channelTagMapTable.tagId, tagId))
      .limit(limit);
    return rows.map((row) => row.channel).filter((tag) => tag !== null);
  }
}
