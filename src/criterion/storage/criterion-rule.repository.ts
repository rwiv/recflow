import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { criterionRuleEnt, CriterionRuleEntAppend } from './criterion.entity.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { uuid } from '../../utils/uuid.js';
import { liveCriterionRuleTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { criterionRuleNameUnion } from '../spec/criterion.rule.schema.js';

const criterionRuleEntReq = criterionRuleEnt
  .partial({ updatedAt: true })
  .extend({ name: criterionRuleNameUnion });
type CriterionRuleEntReq = z.infer<typeof criterionRuleEntReq>;

@Injectable()
export class CriterionRuleRepository {
  async create(append: CriterionRuleEntAppend, tx: Tx = db) {
    const entReq: CriterionRuleEntReq = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(liveCriterionRuleTable).values(criterionRuleEntReq.parse(entReq)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(liveCriterionRuleTable).where(eq(liveCriterionRuleTable.id, id));
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(liveCriterionRuleTable);
  }

  async findById(id: string, tx: Tx = db) {
    const ent = await tx.select().from(liveCriterionRuleTable).where(eq(liveCriterionRuleTable.id, id));
    return oneNullable(ent);
  }

  async findByNameNotNull(name: string, tx: Tx = db) {
    const ent = await this.findByName(name, tx);
    if (!ent) {
      throw NotFoundError.from('CriterionRule', 'name', name);
    }
    return ent;
  }

  async findByName(name: string, tx: Tx = db) {
    const ent = await tx.select().from(liveCriterionRuleTable).where(eq(liveCriterionRuleTable.name, name));
    return oneNullable(ent);
  }
}
