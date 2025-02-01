import { TagRecord } from '../business/types.js';
import { db } from '../../infra/db/db.js';
import { channelsToTags, tags } from './schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';

export class TagRepository {
  async create(name: string, description: string | null = null): Promise<TagRecord> {
    const tagReq = {
      id: uuid(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await db.insert(tags).values(tagReq).returning());
  }

  async attach(channelId: string, tagId: string) {
    await db.insert(channelsToTags).values({ channelId, tagId, createdAt: new Date() });
  }

  async detach(channelId: string, tagId: string) {
    const cond = and(eq(channelsToTags.channelId, channelId), eq(channelsToTags.tagId, tagId));
    const ct = oneNullable(await db.select().from(channelsToTags).where(cond));
    if (!ct) {
      throw new Error('Channel to tag not found');
    }
    await db.delete(channelsToTags).where(cond);
  }

  async findByName(tagName: string): Promise<TagRecord | undefined> {
    return oneNullable(await db.select().from(tags).where(eq(tags.name, tagName)));
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
