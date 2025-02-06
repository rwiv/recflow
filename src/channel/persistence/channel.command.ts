import { oneNotNull } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { ChannelEntCreation, ChannelEnt, ChannelEntUpdate } from './channel.types.js';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from './channel.query.js';

@Injectable()
export class ChannelCommandRepository {
  constructor(private readonly chanQuery: ChannelQueryRepository) {}

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

  async delete(channelId: string, tx: Tx = db) {
    await tx.delete(channels).where(eq(channels.id, channelId));
  }
}
