import { oneNotNull, oneNullable } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels } from './schema.js';
import { eq } from 'drizzle-orm';
import { ChannelCreation, ChannelUpdate, TagRecord } from '../business/types.js';
import { uuid } from '../../utils/uuid.js';
import { TagRepository } from './tag.repository.js';
import { Tx } from '../../infra/db/types.js';
import { processSets } from '../../utils/set.js';

export class ChannelRepository {
  constructor(private readonly tagRepo: TagRepository) {}

  async create(req: ChannelCreation, tx: Tx = db) {
    const toBeAdded = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(channels).values(toBeAdded).returning());
  }

  async updateChannelAndTags(req: ChannelUpdate, reqTagNames: string[], tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const channel = await this.update(req, txx);
      const tags = await this.updateTags(channel.id, reqTagNames, txx);
      return {
        ...channel,
        tags,
      };
    });
  }

  private async update(req: ChannelUpdate, tx: Tx = db) {
    const channel = await this.findById(req.id, tx);
    if (!channel) throw new Error('Channel not found');
    const toBeUpdated = {
      ...channel,
      ...req,
      updatedAt: new Date(),
    };
    return oneNotNull(
      await tx.update(channels).set(toBeUpdated).where(eq(channels.id, req.id)).returning(),
    );
  }

  private async updateTags(channelId: string, tagNames: string[], tx: Tx = db) {
    const tags = await this.tagRepo.findTagsByChannelId(channelId, tx);
    const setA = new Set(tagNames); // expected tags
    const setB = new Set(tags.map((tag) => tag.name)); // existing tags
    const mapB = new Map(tags.map((tag) => [tag.name, tag]));
    const { newSetA, newSetB } = processSets(setA, setB);
    return tx.transaction(async (txx) => {
      const result: TagRecord[] = [];
      for (const tagName of newSetA) {
        const newTag = await this.tagRepo.attach(channelId, tagName, txx);
        result.push(newTag);
      }
      for (const tagName of newSetB) {
        const tag = mapB.get(tagName);
        if (!tag) throw new Error('Tag not found');
        await this.tagRepo.detach(channelId, tag.id, txx);
      }
      return result;
    });
  }

  async delete(channelId: string, tx: Tx = db) {
    const channel = await this.findById(channelId, tx);
    if (!channel) throw new Error('Channel not found');
    const tags = await this.tagRepo.findTagsByChannelId(channel.id, tx);
    return tx.transaction(async (txx) => {
      for (const tag of tags) {
        await this.tagRepo.detach(channel.id, tag.id, txx);
      }
      await txx.delete(channels).where(eq(channels.id, channel.id));
    });
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(channels);
  }

  async findById(channelId: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(channels).where(eq(channels.id, channelId)));
  }

  async findByUsername(username: string, tx: Tx = db) {
    return tx.select().from(channels).where(eq(channels.username, username));
  }
}
