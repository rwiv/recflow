import { TagRecord } from './types.js';
import { db } from '../../infra/db/db.js';
import { channels, channelsToTags, tags } from '../persistence/schema.js';
import { eq } from 'drizzle-orm';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';

export class TagService {
  async create(name: string, description: string | null = null) {
    const tagReq = {
      id: uuid(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await db.insert(tags).values(tagReq).returning()) as TagRecord;
  }

  async attach(channelId: string, tagName: string) {
    const channel = oneNullable(await db.select().from(channels).where(eq(channels.id, channelId)));
    if (!channel) {
      throw new Error('Channel not found');
    }

    let tag = oneNullable(await db.select().from(tags).where(eq(tags.name, tagName)));
    if (!tag) {
      tag = await this.create(tagName);
    }

    await db.insert(channelsToTags).values({
      channelId: channel.id,
      tagId: tag.id,
    });
    return tag;
  }

  async findByChannelId(channelId: string): Promise<TagRecord[]> {
    const rows = await db
      .select()
      .from(channelsToTags)
      .leftJoin(tags, eq(channelsToTags.tagId, tags.id))
      .where(eq(channelsToTags.channelId, channelId));
    return rows.map((row) => row.tags).filter((tag) => tag !== null);
  }
}
