import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channelPriorityTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../utils/uuid.js';
import { PriorityEnt, priorityEnt, PriorityEntAppend, PriorityEntUpdate } from '../spec/priority.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

const priorityEntAppendReq = priorityEnt.partial({ description: true, updatedAt: true });
type PriorityEntAppendRequest = z.infer<typeof priorityEntAppendReq>;

@Injectable()
export class PriorityRepository {
  async create(append: PriorityEntAppend, tx: Tx = db): Promise<PriorityEnt> {
    const reqEnt: PriorityEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      shouldNotify: append.shouldNotify ?? false,
      createdAt: append.createdAt ?? new Date(),
      updatedAt: append.updatedAt ?? null,
    };
    const ent = await tx.insert(channelPriorityTable).values(priorityEntAppendReq.parse(reqEnt)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(channelPriorityTable).where(eq(channelPriorityTable.id, id));
  }

  async update(id: string, update: PriorityEntUpdate, tx: Tx = db): Promise<PriorityEnt> {
    const priority = await this.findById(id, tx);
    if (!priority) throw NotFoundError.from('Priority', 'id', id);
    const req: PriorityEnt = {
      ...priority,
      ...update,
      updatedAt: new Date(),
    };
    const ent = await tx
      .update(channelPriorityTable)
      .set(priorityEnt.parse(req))
      .where(eq(channelPriorityTable.id, id))
      .returning();
    return oneNotNull(ent);
  }

  async findAll(tx: Tx = db): Promise<PriorityEnt[]> {
    return tx.select().from(channelPriorityTable);
  }

  async findById(priorityId: string, tx: Tx = db): Promise<PriorityEnt | undefined> {
    return oneNullable(
      await tx.select().from(channelPriorityTable).where(eq(channelPriorityTable.id, priorityId)),
    );
  }

  async findByName(priorityName: string, tx: Tx = db): Promise<PriorityEnt | undefined> {
    return oneNullable(
      await tx.select().from(channelPriorityTable).where(eq(channelPriorityTable.name, priorityName)),
    );
  }
}
