import { TagRecord } from '../business/types.js';
import { db } from '../../infra/db/db.js';
import { channelsToTags, tags } from './schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';

export class TagRepository {
  async create(name: string, description: string | null = null, tx: Tx = db): Promise<TagRecord> {
    const toBeCreated = {
      id: uuid(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(tags).values(toBeCreated).returning());
  }

  async attach(channelId: string, tagName: string) {
    return db.transaction(async (tx) => {
      let tag = await this.findByName(tagName);
      if (!tag) {
        tag = await this.create(tagName, null, tx);
      }
      await tx.insert(channelsToTags).values({ channelId, tagId: tag.id, createdAt: new Date() });
      return tag;
    });
  }

  async detach(channelId: string, tagId: string) {
    const cond = and(eq(channelsToTags.channelId, channelId), eq(channelsToTags.tagId, tagId));
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
