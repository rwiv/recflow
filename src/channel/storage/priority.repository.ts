import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channelPriorityTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../utils/uuid.js';
import { ChannelPriorityEnt, priorityEnt, PriorityEntAppend } from './priority.schema.js';

const priorityEntAppendReq = priorityEnt.partial({ description: true, updatedAt: true });
type PriorityEntAppendRequest = z.infer<typeof priorityEntAppendReq>;

@Injectable()
export class ChannelPriorityRepository {
  async create(append: PriorityEntAppend, tx: Tx = db): Promise<ChannelPriorityEnt> {
    const reqEnt: PriorityEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
      updatedAt: append.updatedAt ?? null,
    };
    const ent = await tx.insert(channelPriorityTable).values(priorityEntAppendReq.parse(reqEnt)).returning();
    return oneNotNull(ent);
  }

  async findAll(tx: Tx = db): Promise<ChannelPriorityEnt[]> {
    return tx.select().from(channelPriorityTable);
  }

  async findById(priorityId: string, tx: Tx = db): Promise<ChannelPriorityEnt | undefined> {
    return oneNullable(
      await tx.select().from(channelPriorityTable).where(eq(channelPriorityTable.id, priorityId)),
    );
  }

  async findByName(priorityName: string, tx: Tx = db): Promise<ChannelPriorityEnt | undefined> {
    return oneNullable(
      await tx.select().from(channelPriorityTable).where(eq(channelPriorityTable.name, priorityName)),
    );
  }
}
