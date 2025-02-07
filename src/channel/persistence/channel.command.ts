import { oneNotNull } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channelsV2 } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { ChannelEntCreation, ChannelEntUpdate, ChannelEntV2 } from './channel.types.js';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from './channel.query.js';

@Injectable()
export class ChannelCommandRepository {
  constructor(private readonly chQuery: ChannelQueryRepository) {}

  async create(req: ChannelEntCreation, tx: Tx = db): Promise<ChannelEntV2> {
    const toBeAdded = {
      ...req,
      id: uuid(),
      createdAt: req.createdAt ?? new Date(),
      updatedAt: req.updatedAt ?? new Date(),
    };
    return oneNotNull(await tx.insert(channelsV2).values(toBeAdded).returning());
  }

  async update(req: ChannelEntUpdate, tx: Tx = db): Promise<ChannelEntV2> {
    const channel = await this.chQuery.findById(req.id, tx);
    if (!channel) throw new Error('Channel not found');
    const toBeUpdated = {
      ...channel,
      ...req.form,
      updatedAt: new Date(),
    };
    return oneNotNull(
      await tx.update(channelsV2).set(toBeUpdated).where(eq(channelsV2.id, req.id)).returning(),
    );
  }

  async delete(channelId: string, tx: Tx = db) {
    await tx.delete(channelsV2).where(eq(channelsV2.id, channelId));
  }
}
