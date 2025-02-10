import { oneNotNull } from '../../../utils/list.js';
import { db } from '../../../infra/db/db.js';
import { channels } from '../../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../../utils/uuid.js';
import { Tx } from '../../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from './channel.query.js';
import {
  ChannelEnt,
  channelEnt,
  ChannelEntAppend,
  ChannelEntUpdate,
} from './channel.persistence.schema.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { z } from 'zod';

const channelEntAppendReq = channelEnt.partial({ profileImgUrl: true, description: true });
type ChannelEntAppendRequest = z.infer<typeof channelEntAppendReq>;

@Injectable()
export class ChannelCommandRepository {
  constructor(private readonly chQuery: ChannelQueryRepository) {}

  async create(append: ChannelEntAppend, tx: Tx = db): Promise<ChannelEnt> {
    const req: ChannelEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
      updatedAt: append.updatedAt ?? new Date(),
    };
    return oneNotNull(await tx.insert(channels).values(channelEntAppendReq.parse(req)).returning());
  }

  async update(update: ChannelEntUpdate, tx: Tx = db): Promise<ChannelEnt> {
    const channel = await this.chQuery.findById(update.id, tx);
    if (!channel) throw new NotFoundError('Channel not found');
    const req: ChannelEnt = {
      ...channel,
      ...update.form,
      updatedAt: new Date(),
    };
    return oneNotNull(
      await tx
        .update(channels)
        .set(channelEnt.parse(req))
        .where(eq(channels.id, update.id))
        .returning(),
    );
  }

  async delete(channelId: string, tx: Tx = db) {
    await tx.delete(channels).where(eq(channels.id, channelId));
  }
}
