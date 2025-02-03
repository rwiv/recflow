import { oneNotNull, oneNullable } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels, channelsToTags, tags } from './schema.js';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { ChannelCreation, ChannelEnt, ChannelPriority, ChannelUpdate } from './channel.types.js';
import { uuid } from '../../utils/uuid.js';
import { TagRepository } from './tag.repository.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelSortType } from './tag.types.js';

@Injectable()
export class ChannelRepository {
  constructor(private readonly tagRepo: TagRepository) {}

  async create(req: ChannelCreation, tx: Tx = db): Promise<ChannelEnt> {
    const toBeAdded = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return oneNotNull(await tx.insert(channels).values(toBeAdded).returning());
  }

  async update(req: ChannelUpdate, tx: Tx = db): Promise<ChannelEnt> {
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

  async delete(channelId: string, tx: Tx = db): Promise<ChannelEnt> {
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

  findAll(tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channels);
  }

  async findByQuery(
    page: { page: number; size: number } | undefined = undefined,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    tagNamesOr: string[] | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    let query = tx.selectDistinct({ channels }).from(channels).$dynamic();
    const conds = [];

    if (page) {
      if (page.page < 1) throw new Error('Page must be greater than 0');
      const offset = (page.page - 1) * page.size;
      query = query.offset(offset).limit(page.size);
    }

    if (sorted === 'latest') {
      query = query.orderBy(desc(channels.updatedAt));
    } else if (sorted === 'followerCnt') {
      query = query.orderBy(desc(channels.followerCnt));
    }

    if (priority) {
      conds.push(eq(channels.priority, priority));
    }

    query = query.where(and(...conds));

    if (tagName || tagNamesOr) {
      if (tagName && tagNamesOr) {
        throw new Error('Cannot specify both tagName and tagNames');
      }
      if (tagName) {
        conds.push(eq(tags.name, tagName));
      } else if (tagNamesOr) {
        conds.push(inArray(tags.name, tagNamesOr));
      }
      const withTags = await query
        .innerJoin(channelsToTags, eq(channelsToTags.channelId, channels.id))
        .innerJoin(tags, eq(channelsToTags.tagId, tags.id))
        .where(and(...conds));
      return withTags.map((r) => r.channels);
    }
    return (await query).map((r) => r.channels);
  }

  async findById(channelId: string, tx: Tx = db): Promise<ChannelEnt | undefined> {
    return oneNullable(await tx.select().from(channels).where(eq(channels.id, channelId)));
  }

  async findByUsername(username: string, tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channels).where(eq(channels.username, username));
  }
}
