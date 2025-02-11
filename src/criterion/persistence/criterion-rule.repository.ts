import { Injectable } from '@nestjs/common';
import {
  liveCriterionUnitEnt,
  LiveCriterionUnitEntAppend,
} from './criterion.persistence.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { z } from 'zod';
import { liveCriterionUnitTable } from '../../infra/db/schema.js';
import { oneNotNull } from '../../utils/list.js';
import { uuid } from '../../utils/uuid.js';
import { eq } from 'drizzle-orm';

const liveCriterionUnitEntReq = liveCriterionUnitEnt.partial({ updatedAt: true });
type LiveCriterionUnitEntReq = z.infer<typeof liveCriterionUnitEntReq>;

@Injectable()
export class CriterionRuleRepository {
  async create(append: LiveCriterionUnitEntAppend, tx: Tx = db) {
    const entReq: LiveCriterionUnitEntReq = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx
      .insert(liveCriterionUnitTable)
      .values(liveCriterionUnitEntReq.parse(entReq))
      .returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(liveCriterionUnitTable).where(eq(liveCriterionUnitTable.id, id));
  }
}
