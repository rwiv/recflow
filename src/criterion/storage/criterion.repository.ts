import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { oneNotNull, oneNullable } from '@/utils/list.js';

import { db } from '@/infra/db/db.js';
import { liveCriterionTable } from '@/infra/db/schema.js';
import { Tx } from '@/infra/db/types.js';

import {
  CriterionEnt,
  CriterionEntAppend,
  CriterionEntUpdate,
  criterionEnt,
} from '@/criterion/spec/criterion.entity.schema.js';

const criterionEntAppendReq = criterionEnt.partial({ id: true, description: true, updatedAt: true });
type CriterionEntAppendReq = z.infer<typeof criterionEntAppendReq>;

@Injectable()
export class CriterionRepository {
  async create(append: CriterionEntAppend, tx: Tx = db): Promise<CriterionEnt> {
    const entReq: CriterionEntAppendReq = {
      ...append,
      id: append.id,
      isDeactivated: append.isDeactivated ?? true,
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(liveCriterionTable).values(criterionEntAppendReq.parse(entReq)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db): Promise<void> {
    await tx.delete(liveCriterionTable).where(eq(liveCriterionTable.id, id));
  }

  findAll(tx: Tx = db) {
    return tx.select().from(liveCriterionTable);
  }

  findByPlatformId(platformId: string, tx: Tx = db) {
    return tx.select().from(liveCriterionTable).where(eq(liveCriterionTable.platformId, platformId));
  }

  async findById(id: string, tx: Tx = db) {
    const ent = await tx.select().from(liveCriterionTable).where(eq(liveCriterionTable.id, id));
    return oneNullable(ent);
  }

  async findByName(name: string, tx: Tx = db) {
    const ent = await tx.select().from(liveCriterionTable).where(eq(liveCriterionTable.name, name));
    return oneNullable(ent);
  }

  async update(id: string, update: CriterionEntUpdate, tx: Tx = db) {
    const cr = await this.findById(id, tx);
    if (!cr) throw NotFoundError.from('Criterion', 'id', id);
    const req: CriterionEnt = {
      ...cr,
      ...update,
      updatedAt: new Date(),
    };
    const ent = await tx
      .update(liveCriterionTable)
      .set(criterionEnt.parse(req))
      .where(eq(liveCriterionTable.id, id))
      .returning();
    return oneNotNull(ent);
  }
}
