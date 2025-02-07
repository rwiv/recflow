import { oneNotNull } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from './channel.query.js';
import {
  ChannelEnt,
  channelEnt,
  ChannelEntAppend,
  channelEntCreation,
  ChannelEntUpdate,
} from './channel.schema.js';

@Injectable()
export class ChannelCommandRepository {
  constructor(private readonly chQuery: ChannelQueryRepository) {}

  async create(req: ChannelEntAppend, tx: Tx = db): Promise<ChannelEnt> {
    const toBeAdded = channelEntCreation.parse({
      ...req,
      id: uuid(),
      createdAt: req.createdAt ?? new Date(),
      updatedAt: req.updatedAt ?? new Date(),
    });
    return oneNotNull(await tx.insert(channels).values(toBeAdded).returning());
  }

  async update(req: ChannelEntUpdate, tx: Tx = db): Promise<ChannelEnt> {
    const channel = await this.chQuery.findById(req.id, tx);
    if (!channel) throw new Error('Channel not found');
    const toBeUpdated = channelEnt.parse({
      ...channel,
      ...req.form,
      updatedAt: new Date(),
    });
    return oneNotNull(
      await tx.update(channels).set(toBeUpdated).where(eq(channels.id, req.id)).returning(),
    );
  }

  async delete(channelId: string, tx: Tx = db) {
    await tx.delete(channels).where(eq(channels.id, channelId));
  }
}
