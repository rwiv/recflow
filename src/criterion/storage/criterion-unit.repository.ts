import { Injectable } from '@nestjs/common';
import { criterionUnitEnt, CriterionUnitEntAppend } from './criterion.entity.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { z } from 'zod';
import { liveCriterionUnitTable } from '../../infra/db/schema.js';
import { oneNotNull } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';
import { eq } from 'drizzle-orm';

const criterionUnitEntReq = criterionUnitEnt.partial({ updatedAt: true });
type CriterionUnitEntReq = z.infer<typeof criterionUnitEntReq>;

@Injectable()
export class CriterionUnitRepository {
  async create(append: CriterionUnitEntAppend, tx: Tx = db) {
    const entReq: CriterionUnitEntReq = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(liveCriterionUnitTable).values(criterionUnitEntReq.parse(entReq)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(liveCriterionUnitTable).where(eq(liveCriterionUnitTable.id, id));
  }

  async findByCriterionId(criterionId: string, tx: Tx = db) {
    return tx
      .select()
      .from(liveCriterionUnitTable)
      .where(eq(liveCriterionUnitTable.criterionId, criterionId));
  }
}
