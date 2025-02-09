import { Injectable } from '@nestjs/common';
import { liveEnt, LiveEnt, LiveEntAppend, LiveEntUpdate } from './live.persistence.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channels, lives } from '../../infra/db/schema.js';
import { uuid } from '../../utils/uuid.js';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class LiveRepository {
  async create(append: LiveEntAppend, tx: Tx = db) {
    const ent: LiveEnt = {
      ...append,
      id: uuid(),
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };
    return oneNotNull(await tx.insert(lives).values(liveEnt.parse(ent)).returning());
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(lives).where(eq(lives.id, id));
  }

  findAll(tx: Tx = db) {
    return tx.select().from(lives);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(lives).where(eq(lives.id, id)));
  }

  async findByIsDeleted(isDeleted: boolean, tx: Tx = db) {
    return tx.select().from(lives).where(eq(lives.isDeleted, isDeleted));
  }

  async findByPid(pid: string, tx: Tx = db) {
    const rows = await tx
      .select({ lives })
      .from(lives)
      .innerJoin(channels, eq(lives.channelId, channels.id))
      .where(eq(channels.pid, pid));
    return rows.map((row) => row.lives);
  }

  async update(update: LiveEntUpdate, tx: Tx = db) {
    const live = await this.findById(update.id, tx);
    if (!live) {
      throw new NotFoundError(`Not Found Live: ${update.id}`);
    }
    const entReq: LiveEnt = {
      ...live,
      ...update.form,
      updatedAt: new Date(),
    };
    const ent = await tx
      .update(lives)
      .set(liveEnt.parse(entReq))
      .where(eq(lives.id, update.id))
      .returning();
    return oneNotNull(ent);
  }
}
