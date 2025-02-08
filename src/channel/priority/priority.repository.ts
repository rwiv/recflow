import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channelPriorities } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../utils/uuid.js';
import { ChannelPriorityEnt, chPriorityEnt } from './priority.persistence.schema.js';

@Injectable()
export class ChannelPriorityRepository {
  async create(name: string, tier: number, tx: Tx = db): Promise<ChannelPriorityEnt> {
    const append: ChannelPriorityEnt = {
      id: uuid(),
      name,
      tier,
      createdAt: new Date(),
      updatedAt: null,
    };
    const ent = await tx.insert(channelPriorities).values(chPriorityEnt.parse(append)).returning();
    return oneNotNull(ent);
  }

  async findAll(tx: Tx = db): Promise<ChannelPriorityEnt[]> {
    return tx.select().from(channelPriorities);
  }

  async findById(priorityId: string, tx: Tx = db): Promise<ChannelPriorityEnt | undefined> {
    return oneNullable(
      await tx.select().from(channelPriorities).where(eq(channelPriorities.id, priorityId)),
    );
  }

  async findByName(priorityName: string, tx: Tx = db): Promise<ChannelPriorityEnt | undefined> {
    return oneNullable(
      await tx.select().from(channelPriorities).where(eq(channelPriorities.name, priorityName)),
    );
  }
}
