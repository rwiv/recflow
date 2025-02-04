import { oneNotNull } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels } from './schema.js';
import { eq } from 'drizzle-orm';
import { ChannelEntCreation, ChannelEnt, ChannelEntUpdate } from './channel.types.js';
import { uuid } from '../../utils/uuid.js';
import { TagCommandRepository } from './tag.command.repository.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from './channel.query.repository.js';
import { TagQueryRepository } from './tag.query.repository.js';

@Injectable()
export class ChannelCommandRepository {
  constructor(
    private readonly tagCmdRepo: TagCommandRepository,
    private readonly tagQueryRepo: TagQueryRepository,
    private readonly chanQuery: ChannelQueryRepository,
  ) {}

  async create(req: ChannelEntCreation, tx: Tx = db): Promise<ChannelEnt> {
    const toBeAdded = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return oneNotNull(await tx.insert(channels).values(toBeAdded).returning());
  }

  async update(req: ChannelEntUpdate, tx: Tx = db): Promise<ChannelEnt> {
    const channel = await this.chanQuery.findById(req.id, tx);
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
    const channel = await this.chanQuery.findById(channelId, tx);
    if (!channel) throw new Error('Channel not found');
    const tags = await this.tagQueryRepo.findTagsByChannelId(channel.id, tx);
    return tx.transaction(async (txx) => {
      for (const tag of tags) {
        await this.tagCmdRepo.detach({ channelId: channel.id, tagId: tag.id }, txx);
      }
      await txx.delete(channels).where(eq(channels.id, channel.id));
      return channel;
    });
  }
}
