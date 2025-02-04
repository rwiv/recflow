import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { TagEnt } from './tag.types.js';
import { channels, channelsToTags, tags } from './schema.js';
import { oneNullable } from '../../utils/list.js';
import { eq, inArray } from 'drizzle-orm';
import { ChannelEnt } from './channel.types.js';

@Injectable()
export class TagQueryRepository {
  async findAll(tx: Tx = db): Promise<TagEnt[]> {
    return tx.select().from(tags);
  }

  async findById(tagId: string, tx: Tx = db): Promise<TagEnt | undefined> {
    return oneNullable(await tx.select().from(tags).where(eq(tags.id, tagId)));
  }

  async findByName(tagName: string, tx: Tx = db): Promise<TagEnt | undefined> {
    return oneNullable(await tx.select().from(tags).where(eq(tags.name, tagName)));
  }

  async findTagsByChannelId(channelId: string, tx: Tx = db): Promise<TagEnt[]> {
    const rows = await tx
      .select()
      .from(channelsToTags)
      .innerJoin(tags, eq(channelsToTags.tagId, tags.id))
      .where(eq(channelsToTags.channelId, channelId));
    return rows.map((row) => row.tags).filter((tag) => tag !== null);
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

  async findIdsByNames(tagNames: string[], tx: Tx = db) {
    const records = await tx.select({ id: tags.id }).from(tags).where(inArray(tags.name, tagNames));
    return records.map((tag) => tag.id);
  }
}
