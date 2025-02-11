import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import {
  liveCriterionRuleEnt,
  LiveCriterionRuleEntAppend,
} from './criterion.persistence.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { uuid } from '../../utils/uuid.js';
import { liveCriterionRuleTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { oneNotNull } from '../../utils/list.js';

const liveCriterionRuleEntReq = liveCriterionRuleEnt.partial({ updatedAt: true });
type LiveCriterionRuleEntReq = z.infer<typeof liveCriterionRuleEntReq>;

@Injectable()
export class CriterionUnitRepository {
  async create(append: LiveCriterionRuleEntAppend, tx: Tx = db) {
    const entReq: LiveCriterionRuleEntReq = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx
      .insert(liveCriterionRuleTable)
      .values(liveCriterionRuleEntReq.parse(entReq))
      .returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(liveCriterionRuleTable).where(eq(liveCriterionRuleTable.id, id));
  }
}
