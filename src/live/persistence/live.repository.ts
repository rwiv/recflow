import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { liveEnt, LiveEnt, LiveEntAppend, LiveEntUpdate } from './live.persistence.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channelTable, liveTable } from '../../infra/db/schema.js';
import { uuid } from '../../utils/uuid.js';
import { asc, eq } from 'drizzle-orm';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

const liveEntAppendReq = liveEnt.partial({ updatedAt: true, deletedAt: true });
type LiveEntAppendRequest = z.infer<typeof liveEntAppendReq>;

@Injectable()
export class LiveRepository {
  async create(append: LiveEntAppend, tx: Tx = db) {
    const ent: LiveEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      isDeleted: append.isDeleted ?? false,
      createdAt: append.createdAt ?? new Date(),
    };
    return oneNotNull(await tx.insert(liveTable).values(liveEntAppendReq.parse(ent)).returning());
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

  async findByIsDeleted(isDeleted: boolean, tx: Tx = db) {
    return tx
      .select()
      .from(liveTable)
      .where(eq(liveTable.isDeleted, isDeleted))
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

  async update(update: LiveEntUpdate, tx: Tx = db) {
    const live = await this.findById(update.id, tx);
    if (!live) {
      throw NotFoundError.from('Live', 'id', update.id);
    }
    const entReq: LiveEnt = {
      ...live,
      ...update.form,
      updatedAt: new Date(),
    };
    const ent = await tx
      .update(liveTable)
      .set(liveEnt.parse(entReq))
      .where(eq(liveTable.id, update.id))
      .returning();
    return oneNotNull(ent);
  }
}
