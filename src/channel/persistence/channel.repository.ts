import { oneNotNull, oneNullable } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels } from './schema.js';
import { eq } from 'drizzle-orm';
import { ChannelCreation, ChannelRecord, ChannelUpdate } from './channel.types.js';
import { uuid } from '../../utils/uuid.js';
import { TagRepository } from './tag.repository.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelRepository {
  constructor(private readonly tagRepo: TagRepository) {}

  async create(req: ChannelCreation, tx: Tx = db): Promise<ChannelRecord> {
    const toBeAdded = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(channels).values(toBeAdded).returning());
  }

  async update(req: ChannelUpdate, tx: Tx = db): Promise<ChannelRecord> {
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

  async findAll(tx: Tx = db): Promise<ChannelRecord[]> {
    return tx.select().from(channels);
  }

  async findById(channelId: string, tx: Tx = db): Promise<ChannelRecord | undefined> {
    return oneNullable(await tx.select().from(channels).where(eq(channels.id, channelId)));
  }

  async findByUsername(username: string, tx: Tx = db): Promise<ChannelRecord[]> {
    return tx.select().from(channels).where(eq(channels.username, username));
  }
}
