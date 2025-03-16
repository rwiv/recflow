import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { liveEnt, LiveEnt, LiveEntAppend, LiveEntUpdate } from '../spec/live.entity.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channelTable, liveTable } from '../../infra/db/schema.js';
import { uuid } from '../../utils/uuid.js';
import { asc, eq, sql } from 'drizzle-orm';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

const liveEntAppendReq = liveEnt.partial({
  nodeId: true,
  updatedAt: true,
  deletedAt: true,
  disconnectedAt: true,
});
type LiveEntAppendRequest = z.infer<typeof liveEntAppendReq>;

@Injectable()
export class LiveRepository {
  async create(append: LiveEntAppend, tx: Tx = db) {
    const req: LiveEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      isDisabled: append.isDisabled ?? false,
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(liveTable).values(liveEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(liveTable).where(eq(liveTable.id, id));
  }

  findAll(tx: Tx = db) {
    return tx.select().from(liveTable).orderBy(asc(liveTable.createdAt));
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(liveTable).where(eq(liveTable.id, id)));
  }

  async findByIdForUpdate(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(liveTable).where(eq(liveTable.id, id)).for('update'));
  }

  async findByIsDeleted(isDisabled: boolean, tx: Tx = db) {
    return tx
      .select()
      .from(liveTable)
      .where(eq(liveTable.isDisabled, isDisabled))
      .orderBy(asc(liveTable.createdAt));
  }

  async findByPid(pid: string, tx: Tx = db) {
    const rows = await tx
      .select({ lives: liveTable })
      .from(liveTable)
      .innerJoin(channelTable, eq(liveTable.channelId, channelTable.id))
      .where(eq(channelTable.pid, pid));
    return rows.map((row) => row.lives);
  }

  async findByNodeId(nodeId: string, tx: Tx = db) {
    return tx.select().from(liveTable).where(eq(liveTable.nodeId, nodeId));
  }

  async update(id: string, update: LiveEntUpdate, tx: Tx = db) {
    const live = await this.findById(id, tx);
    if (!live) {
      throw NotFoundError.from('Live', 'id', id);
    }
    const entReq: LiveEnt = {
      ...live,
      ...update,
      updatedAt: new Date(),
    };
    const ent = await tx.update(liveTable).set(liveEnt.parse(entReq)).where(eq(liveTable.id, id)).returning();
    return oneNotNull(ent);
  }

  async findEarliestUpdated(limit: number, tx: Tx = db): Promise<LiveEnt[]> {
    return tx
      .select()
      .from(liveTable)
      .orderBy(sql`${liveTable.updatedAt} ASC NULLS FIRST`)
      .limit(limit);
  }
}
