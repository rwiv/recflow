import { oneNotNull, oneNullable } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels, channelsToTags, tags } from './schema.js';
import { and, desc, eq } from 'drizzle-orm';
import { ChannelCreation, ChannelPriority, ChannelRecord, ChannelUpdate } from './channel.types.js';
import { uuid } from '../../utils/uuid.js';
import { TagRepository } from './tag.repository.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelSortType } from './tag.types.js';

@Injectable()
export class ChannelRepository {
  constructor(private readonly tagRepo: TagRepository) {}

  async create(req: ChannelCreation, tx: Tx = db): Promise<ChannelRecord> {
    const toBeAdded = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return oneNotNull(await tx.insert(channels).values(toBeAdded).returning());
  }

  async update(req: ChannelUpdate, tx: Tx = db): Promise<ChannelRecord> {
    const channel = await this.findById(req.id, tx);
    if (!channel) throw new Error('Channel not found');
    const toBeUpdated = {
      ...channel,
      ...req.form,
      updatedAt: new Date(),
    };
    return oneNotNull(
      await tx.update(channels).set(toBeUpdated).where(eq(channels.id, req.id)).returning(),
    );
  }

  async delete(channelId: string, tx: Tx = db): Promise<ChannelRecord> {
    const channel = await this.findById(channelId, tx);
    if (!channel) throw new Error('Channel not found');
    const tags = await this.tagRepo.findTagsByChannelId(channel.id, tx);
    return tx.transaction(async (txx) => {
      for (const tag of tags) {
        await this.tagRepo.detach({ channelId: channel.id, tagId: tag.id }, txx);
      }
      await txx.delete(channels).where(eq(channels.id, channel.id));
      return channel;
    });
  }

  findAll(tx: Tx = db): Promise<ChannelRecord[]> {
    return tx.select().from(channels);
  }

  async findByQuery(
    page: number,
    size: number,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelRecord[]> {
    if (page < 1) throw new Error('Page must be greater than 0');
    const offset = (page - 1) * size;
    let query = tx.select().from(channels).offset(offset).limit(size).$dynamic();
    if (sorted === 'latest') {
      query = query.orderBy(desc(channels.updatedAt));
    } else if (sorted === 'followerCnt') {
      query = query.orderBy(desc(channels.followerCnt));
    }
    if (tagName) {
      const withTags = await query
        .leftJoin(channelsToTags, eq(channelsToTags.channelId, channels.id))
        .leftJoin(tags, eq(tags.id, channelsToTags.tagId))
        .where(and(eq(tags.name, tagName), priority ? eq(channels.priority, priority) : undefined));
      return withTags.map((r) => r.channels);
    }
    if (priority) {
      query = query.where(eq(channels.priority, priority));
    }
    return query;
  }

  async findById(channelId: string, tx: Tx = db): Promise<ChannelRecord | undefined> {
    return oneNullable(await tx.select().from(channels).where(eq(channels.id, channelId)));
  }

  async findByUsername(username: string, tx: Tx = db): Promise<ChannelRecord[]> {
    return tx.select().from(channels).where(eq(channels.username, username));
  }
}
