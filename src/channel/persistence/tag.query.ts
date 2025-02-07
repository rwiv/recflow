import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { TagEnt } from './tag.types.js';
import { channelsToTags, channelTags } from '../../infra/db/schema.js';
import { oneNullable } from '../../utils/list.js';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class TagQueryRepository {
  async findAll(tx: Tx = db): Promise<TagEnt[]> {
    return tx.select().from(channelTags);
  }

  async findById(tagId: string, tx: Tx = db): Promise<TagEnt | undefined> {
    return oneNullable(await tx.select().from(channelTags).where(eq(channelTags.id, tagId)));
  }

  async findByName(tagName: string, tx: Tx = db): Promise<TagEnt | undefined> {
    return oneNullable(await tx.select().from(channelTags).where(eq(channelTags.name, tagName)));
  }

  async findTagsByChannelId(channelId: string, tx: Tx = db): Promise<TagEnt[]> {
    const rows = await tx
      .select()
      .from(channelsToTags)
      .innerJoin(channelTags, eq(channelsToTags.tagId, channelTags.id))
      .where(eq(channelsToTags.channelId, channelId));
    return rows.map((row) => row.channel_tags).filter((tag) => tag !== null);
  }

  async findIdsByNames(tagNames: string[], tx: Tx = db) {
    const records = await tx
      .select({ id: channelTags.id })
      .from(channelTags)
      .where(inArray(channelTags.name, tagNames));
    return records.map((tag) => tag.id);
  }
}
