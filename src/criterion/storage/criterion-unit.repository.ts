import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { oneNotNull } from '@/utils/list.js';

import { db } from '@/infra/db/db.js';
import { liveCriterionUnitTable } from '@/infra/db/schema.js';
import { Tx } from '@/infra/db/types.js';

import { CriterionUnitEntAppend, criterionUnitEnt } from '@/criterion/spec/criterion.entity.schema.js';

const criterionUnitEntReq = criterionUnitEnt.partial({ id: true, updatedAt: true });
type CriterionUnitEntReq = z.infer<typeof criterionUnitEntReq>;

@Injectable()
export class CriterionUnitRepository {
  async create(append: CriterionUnitEntAppend, tx: Tx = db) {
    const entReq: CriterionUnitEntReq = {
      ...append,
      id: append.id,
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(liveCriterionUnitTable).values(criterionUnitEntReq.parse(entReq)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(liveCriterionUnitTable).where(eq(liveCriterionUnitTable.id, id));
  }

  async findByCriterionId(criterionId: string, tx: Tx = db) {
    return tx.select().from(liveCriterionUnitTable).where(eq(liveCriterionUnitTable.criterionId, criterionId));
  }
}
