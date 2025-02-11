import { Injectable } from '@nestjs/common';
import { CriterionEnt, criterionEnt, CriterionEntAppend } from './criterion.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { z } from 'zod';
import { liveCriterionTable } from '../../infra/db/schema.js';
import { oneNotNull } from '../../utils/list.js';
import { eq } from 'drizzle-orm';

const criterionEntAppendReq = criterionEnt.partial({ description: true, updatedAt: true });
type CriterionEntAppendReq = z.infer<typeof criterionEntAppendReq>;

@Injectable()
export class CriterionRepository {
  async create(append: CriterionEntAppend, tx: Tx = db): Promise<CriterionEnt> {
    const entReq: CriterionEntAppendReq = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx
      .insert(liveCriterionTable)
      .values(criterionEntAppendReq.parse(entReq))
      .returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db): Promise<void> {
    await tx.delete(liveCriterionTable).where(eq(liveCriterionTable.id, id));
  }

  findAll(tx: Tx = db) {
    return tx.select().from(liveCriterionTable);
  }

  findByPlatformId(platformId: string, tx: Tx = db) {
    return tx
      .select()
      .from(liveCriterionTable)
      .where(eq(liveCriterionTable.platformId, platformId));
  }

  async findById(id: string, tx: Tx = db) {
    const ent = await tx.select().from(liveCriterionTable).where(eq(liveCriterionTable.id, id));
    return oneNotNull(ent);
  }

  async findByName(name: string, tx: Tx = db) {
    const ent = await tx.select().from(liveCriterionTable).where(eq(liveCriterionTable.name, name));
    return oneNotNull(ent);
  }
}
