import { Injectable } from '@nestjs/common';
import {
  LiveCriterionEnt,
  liveCriterionEnt,
  LiveCriterionEntAppend,
} from './criterion.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { z } from 'zod';
import { liveCriterionTable } from '../../infra/db/schema.js';
import { oneNotNull } from '../../utils/list.js';
import { eq } from 'drizzle-orm';

const liveCriterionEntAppendReq = liveCriterionEnt.partial({ description: true, updatedAt: true });
type LiveCriterionEntAppendReq = z.infer<typeof liveCriterionEntAppendReq>;

@Injectable()
export class CriterionRepository {
  async create(append: LiveCriterionEntAppend, tx: Tx = db): Promise<LiveCriterionEnt> {
    const entReq: LiveCriterionEntAppendReq = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx
      .insert(liveCriterionTable)
      .values(liveCriterionEntAppendReq.parse(entReq))
      .returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db): Promise<void> {
    await tx.delete(liveCriterionTable).where(eq(liveCriterionTable.id, id));
  }
}
