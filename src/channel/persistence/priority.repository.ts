import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channelPriorities } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../utils/uuid.js';

@Injectable()
export class ChannelPriorityRepository {
  async create(name: string, tx: Tx = db) {
    const req = { id: uuid(), name, createdAt: new Date(), updatedAt: null };
    return oneNotNull(await tx.insert(channelPriorities).values(req).returning());
  }

  async findById(priorityId: string, tx: Tx = db) {
    return oneNullable(
      await tx.select().from(channelPriorities).where(eq(channelPriorities.id, priorityId)),
    );
  }

  async findByName(priorityName: string, tx: Tx = db) {
    return oneNullable(
      await tx.select().from(channelPriorities).where(eq(channelPriorities.name, priorityName)),
    );
  }
}
