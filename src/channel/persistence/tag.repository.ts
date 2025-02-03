import { ChannelEnt } from './channel.types.js';
import { db } from '../../infra/db/db.js';
import { channels, channelsToTags, tags } from './schema.js';
import { and, eq } from 'drizzle-orm';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
import { processSets } from '../../utils/set.js';
import { assertNotNull } from '../../utils/null.js';
import { Injectable } from '@nestjs/common';
import { TagAttachment, TagCreation, TagDetachment, TagEnt, TagUpdate } from './tag.types.js';

@Injectable()
export class TagRepository {
  private async create(req: TagCreation, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.findByName(req.name, tx);
    if (tag) throw new Error('Tag already exists');
    const tbc = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(tags).values(tbc).returning());
  }

  async update(req: TagUpdate, tx: Tx = db): Promise<TagEnt> {
    const tag = await this.findById(req.tagId, tx);
    if (!tag) throw new Error('Tag not found');
    const tbu = {
      ...tag,
      ...req.form,
      updatedAt: new Date(),
    };
    return oneNotNull(await tx.update(tags).set(tbu).where(eq(tags.id, req.tagId)).returning());
  }

  async attach(req: TagAttachment, tx: Tx = db): Promise<TagEnt> {
    return tx.transaction(async (txx) => {
      let tag = await this.findByName(req.tagName, txx);
      if (!tag) {
        tag = await this.create({ name: req.tagName }, txx);
      }
      const tbc = { channelId: req.channelId, tagId: tag.id, createdAt: new Date() };
      await txx.insert(channelsToTags).values(tbc);
      return tag;
    });
  }

  async detach(req: TagDetachment, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const cond = and(
        eq(channelsToTags.channelId, req.channelId),
        eq(channelsToTags.tagId, req.tagId),
      );
      await txx.delete(channelsToTags).where(cond);
      if ((await this.findChannelsByTagId(req.tagId, 1, txx)).length === 0) {
        await txx.delete(tags).where(eq(tags.id, req.tagId));
      }
    });
  }

  async applyTags(channelId: string, tagNames: string[], tx: Tx = db): Promise<TagEnt[]> {
    const tags = await this.findTagsByChannelId(channelId, tx);
    const setA = new Set(tags.map((tag) => tag.name)); // existing tags
    const mapA = new Map(tags.map((tag) => [tag.name, tag]));
    const setB = new Set(tagNames); // expected tags
    const { intersection, newSetA, newSetB } = processSets(setA, setB);
    return tx.transaction(async (txx) => {
      const result: TagEnt[] = [];
      for (const tagName of intersection) {
        const tag = assertNotNull(mapA.get(tagName));
        result.push(tag);
      }
      for (const tagName of newSetA) {
        const tag = assertNotNull(mapA.get(tagName));
        await this.detach({ channelId, tagId: tag.id }, txx);
      }
      for (const tagName of newSetB) {
        const newTag = await this.attach({ channelId, tagName }, txx);
        result.push(newTag);
      }
      return result;
    });
  }

  async findAll(tx: Tx = db): Promise<TagEnt[]> {
    return tx.select().from(tags);
  }

  private async findById(tagId: string, tx: Tx = db): Promise<TagEnt | undefined> {
    return oneNullable(await tx.select().from(tags).where(eq(tags.id, tagId)));
  }

  private async findByName(tagName: string, tx: Tx = db): Promise<TagEnt | undefined> {
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
}
