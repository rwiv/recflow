import { oneNotNull } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../utils/uuid.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from './channel.query.js';
import { ChannelEnt, channelEnt, ChannelEntAppend, ChannelEntUpdate } from './channel.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { z } from 'zod';

const channelEntAppendReq = channelEnt.partial({ profileImgUrl: true, description: true });
type ChannelEntAppendRequest = z.infer<typeof channelEntAppendReq>;

@Injectable()
export class ChannelCommandRepository {
  constructor(private readonly chQuery: ChannelQueryRepository) {}

  async create(req: ChannelEntAppend, tx: Tx = db): Promise<ChannelEnt> {
    const toBeAdded: ChannelEntAppendRequest = {
      ...req,
      id: uuid(),
      createdAt: req.createdAt ?? new Date(),
      updatedAt: req.updatedAt ?? new Date(),
    };
    return oneNotNull(
      await tx.insert(channels).values(channelEntAppendReq.parse(toBeAdded)).returning(),
    );
  }

  async update(req: ChannelEntUpdate, tx: Tx = db): Promise<ChannelEnt> {
    const channel = await this.chQuery.findById(req.id, tx);
    if (!channel) throw new NotFoundError('Channel not found');
    const update: ChannelEnt = {
      ...channel,
      ...req.form,
      updatedAt: new Date(),
    };
    return oneNotNull(
      await tx
        .update(channels)
        .set(channelEnt.parse(update))
        .where(eq(channels.id, req.id))
        .returning(),
    );
  }

  async delete(channelId: string, tx: Tx = db) {
    await tx.delete(channels).where(eq(channels.id, channelId));
  }
}
