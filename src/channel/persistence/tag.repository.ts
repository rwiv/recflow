import { ChannelRecord, TagRecord } from './types.js';
import { db } from '../../infra/db/db.js';
import { channels, channelsToTags, tags } from './schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
import { processSets } from '../../utils/set.js';

export class TagRepository {
  private async create(
    name: string,
    description: string | null = null,
    tx: Tx = db,
  ): Promise<TagRecord> {
    const tag = await this.findByName(name, tx);
    if (tag) throw new Error('Tag already exists');
    const req = {
      id: uuid(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(tags).values(req).returning());
  }

  async update(
    tagId: string,
    name: string,
    description: string | null = null,
    tx: Tx = db,
  ): Promise<TagRecord> {
    const tag = await this.findById(tagId, tx);
    if (!tag) throw new Error('Tag not found');
    const req = {
      ...tag,
      name,
      description,
      updatedAt: new Date(),
    };
    return oneNotNull(await tx.update(tags).set(req).where(eq(tags.name, name)).returning());
  }

  async attach(channelId: string, tagName: string, tx: Tx = db): Promise<TagRecord> {
    return tx.transaction(async (txx) => {
      let tag = await this.findByName(tagName, txx);
      if (!tag) {
        tag = await this.create(tagName, null, txx);
      }
      await txx.insert(channelsToTags).values({ channelId, tagId: tag.id, createdAt: new Date() });
      return tag;
    });
  }

  async detach(channelId: string, tagId: string, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const cond = and(eq(channelsToTags.channelId, channelId), eq(channelsToTags.tagId, tagId));
      await txx.delete(channelsToTags).where(cond);
      if ((await this.findChannelsByTagId(tagId, 1, txx)).length === 0) {
        await txx.delete(tags).where(eq(tags.id, tagId));
      }
    });
  }

  async applyTags(channelId: string, tagNames: string[], tx: Tx = db): Promise<TagRecord[]> {
    const tags = await this.findTagsByChannelId(channelId, tx);
    const setA = new Set(tagNames); // expected tags
    const setB = new Set(tags.map((tag) => tag.name)); // existing tags
    const mapB = new Map(tags.map((tag) => [tag.name, tag]));
    const { newSetA, newSetB } = processSets(setA, setB);
    return tx.transaction(async (txx) => {
      const result: TagRecord[] = [];
      for (const tagName of newSetA) {
        const newTag = await this.attach(channelId, tagName, txx);
        result.push(newTag);
      }
      for (const tagName of newSetB) {
        const tag = mapB.get(tagName);
        if (!tag) throw new Error('Tag not found');
        await this.detach(channelId, tag.id, txx);
      }
      return result;
    });
  }

  private async findById(tagId: string, tx: Tx = db): Promise<TagRecord | undefined> {
    return oneNullable(await tx.select().from(tags).where(eq(tags.id, tagId)));
  }

  private async findByName(tagName: string, tx: Tx = db): Promise<TagRecord | undefined> {
    return oneNullable(await tx.select().from(tags).where(eq(tags.name, tagName)));
  }

  async findTagsByChannelId(channelId: string, tx: Tx = db): Promise<TagRecord[]> {
    const rows = await tx
      .select()
      .from(channelsToTags)
      .leftJoin(tags, eq(channelsToTags.tagId, tags.id))
      .where(eq(channelsToTags.channelId, channelId));
    return rows.map((row) => row.tags).filter((tag) => tag !== null);
  }

  private async findChannelsByTagId(
    tagId: string,
    limit: number,
    tx: Tx = db,
  ): Promise<ChannelRecord[]> {
    const rows = await tx
      .select()
      .from(channelsToTags)
      .leftJoin(channels, eq(channelsToTags.channelId, channels.id))
      .where(eq(channelsToTags.tagId, tagId))
      .limit(limit);
    return rows.map((row) => row.channels).filter((tag) => tag !== null);
  }
}
