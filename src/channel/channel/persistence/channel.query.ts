import { db } from '../../../infra/db/db.js';
import { channelsToTags, channels, platforms } from '../../../infra/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { Tx } from '../../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { oneNullable } from '../../../utils/list.js';
import { PlatformType } from '../../../platform/types.js';
import { ChannelEnt } from './channel.schema.js';

@Injectable()
export class ChannelQueryRepository {
  findAll(tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channels);
  }

  async findById(channelId: string, tx: Tx = db): Promise<ChannelEnt | undefined> {
    return oneNullable(await tx.select().from(channels).where(eq(channels.id, channelId)));
  }

  async findByPid(pid: string, tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channels).where(eq(channels.pid, pid));
  }

  async findByPidAndPlatform(
    pid: string,
    platformName: PlatformType,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const entities = await tx
      .select()
      .from(channels)
      .innerJoin(platforms, eq(channels.platformId, platforms.id))
      .where(and(eq(channels.pid, pid), eq(platforms.name, platformName)));
    return entities.map((entity) => entity.channels);
  }

  async findByUsername(username: string, tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channels).where(eq(channels.username, username));
  }

  async findByFollowedFlag(
    followed: boolean,
    platformName: PlatformType,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const entities = await tx
      .select()
      .from(channels)
      .innerJoin(platforms, eq(channels.platformId, platforms.id))
      .where(and(eq(channels.followed, followed), eq(platforms.name, platformName)));
    return entities.map((entity) => entity.channels);
  }

  async findChannelsByTagId(tagId: string, limit: number, tx: Tx = db): Promise<ChannelEnt[]> {
    const rows = await tx
      .select()
      .from(channelsToTags)
      .innerJoin(channels, eq(channelsToTags.channelId, channels.id))
      .where(eq(channelsToTags.tagId, tagId))
      .limit(limit);
    return rows.map((row) => row.channels).filter((tag) => tag !== null);
  }
}
