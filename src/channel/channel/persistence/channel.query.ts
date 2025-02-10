import { db } from '../../../infra/db/db.js';
import { channelTagMapTable, channelTable, platformTable } from '../../../infra/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { Tx } from '../../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { oneNullable } from '../../../utils/list.js';
import { ChannelEnt } from './channel.persistence.schema.js';
import { PlatformType } from '../../../platform/platform.schema.js';

@Injectable()
export class ChannelQueryRepository {
  findAll(tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channelTable);
  }

  async findById(channelId: string, tx: Tx = db): Promise<ChannelEnt | undefined> {
    return oneNullable(await tx.select().from(channelTable).where(eq(channelTable.id, channelId)));
  }

  async findByPid(pid: string, tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channelTable).where(eq(channelTable.pid, pid));
  }

  async findByPidAndPlatform(
    pid: string,
    platformName: PlatformType,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const entities = await tx
      .select()
      .from(channelTable)
      .innerJoin(platformTable, eq(channelTable.platformId, platformTable.id))
      .where(and(eq(channelTable.pid, pid), eq(platformTable.name, platformName)));
    return entities.map((entity) => entity.channel);
  }

  async findByUsername(username: string, tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channelTable).where(eq(channelTable.username, username));
  }

  async findByFollowedFlag(
    followed: boolean,
    platformName: PlatformType,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const entities = await tx
      .select()
      .from(channelTable)
      .innerJoin(platformTable, eq(channelTable.platformId, platformTable.id))
      .where(and(eq(channelTable.followed, followed), eq(platformTable.name, platformName)));
    return entities.map((entity) => entity.channel);
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
