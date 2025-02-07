import { db } from '../../infra/db/db.js';
import { channelsToTags, channelsV2, platforms } from '../../infra/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { ChannelEntV2 } from './channel.types.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { oneNullable } from '../../utils/list.js';
import { PlatformType } from '../../platform/types.js';

@Injectable()
export class ChannelQueryRepository {
  findAll(tx: Tx = db): Promise<ChannelEntV2[]> {
    return tx.select().from(channelsV2);
  }

  async findById(channelId: string, tx: Tx = db): Promise<ChannelEntV2 | undefined> {
    return oneNullable(await tx.select().from(channelsV2).where(eq(channelsV2.id, channelId)));
  }

  async findByPid(pid: string, tx: Tx = db): Promise<ChannelEntV2[]> {
    return tx.select().from(channelsV2).where(eq(channelsV2.pid, pid));
  }

  async findByPidAndPlatform(
    pid: string,
    platformName: PlatformType,
    tx: Tx = db,
  ): Promise<ChannelEntV2[]> {
    const entities = await tx
      .select()
      .from(channelsV2)
      .innerJoin(platforms, eq(channelsV2.platformId, platforms.id))
      .where(and(eq(channelsV2.pid, pid), eq(platforms.name, platformName)));
    return entities.map((entity) => entity.channels_v2);
  }

  async findByUsername(username: string, tx: Tx = db): Promise<ChannelEntV2[]> {
    return tx.select().from(channelsV2).where(eq(channelsV2.username, username));
  }

  async findByFollowedFlag(
    followed: boolean,
    platformName: PlatformType,
    tx: Tx = db,
  ): Promise<ChannelEntV2[]> {
    const entities = await tx
      .select()
      .from(channelsV2)
      .innerJoin(platforms, eq(channelsV2.platformId, platforms.id))
      .where(and(eq(channelsV2.followed, followed), eq(platforms.name, platformName)));
    return entities.map((entity) => entity.channels_v2);
  }

  async findChannelsByTagId(tagId: string, limit: number, tx: Tx = db): Promise<ChannelEntV2[]> {
    const rows = await tx
      .select()
      .from(channelsToTags)
      .innerJoin(channelsV2, eq(channelsToTags.channelId, channelsV2.id))
      .where(eq(channelsToTags.tagId, tagId))
      .limit(limit);
    return rows.map((row) => row.channels_v2).filter((tag) => tag !== null);
  }
}
