import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { channelGradeTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { GradeEnt, gradeEnt, GradeEntAppend, GradeEntUpdate } from '../spec/grade.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { DEFAULT_PRIORITY_NAME } from '../spec/grade.constants.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

const gradeEntAppendReq = gradeEnt.partial({ id: true, description: true, updatedAt: true });
type GradeEntAppendRequest = z.infer<typeof gradeEntAppendReq>;

@Injectable()
export class GradeRepository {
  async create(append: GradeEntAppend, tx: Tx = db): Promise<GradeEnt> {
    const reqEnt: GradeEntAppendRequest = {
      ...append,
      id: append.id,
      shouldNotify: append.shouldNotify ?? false,
      createdAt: append.createdAt ?? new Date(),
      updatedAt: append.updatedAt ?? null,
    };
    const ent = await tx.insert(channelGradeTable).values(gradeEntAppendReq.parse(reqEnt)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(channelGradeTable).where(eq(channelGradeTable.id, id));
  }

  async update(id: string, update: GradeEntUpdate, tx: Tx = db): Promise<GradeEnt> {
    const ent = await this.findById(id, tx);
    if (!ent) throw NotFoundError.from('Grade', 'id', id);
    if (ent.name === DEFAULT_PRIORITY_NAME && update.name !== undefined) {
      throw new ValidationError('Cannot update default grade name');
    }
    const req: GradeEnt = {
      ...ent,
      ...update,
      updatedAt: new Date(),
    };
    const updated = await tx
      .update(channelGradeTable)
      .set(gradeEnt.parse(req))
      .where(eq(channelGradeTable.id, id))
      .returning();
    return oneNotNull(updated);
  }

  async findAll(tx: Tx = db): Promise<GradeEnt[]> {
    return tx.select().from(channelGradeTable);
  }

  async findById(gradeId: string, tx: Tx = db): Promise<GradeEnt | null> {
    return oneNullable(await tx.select().from(channelGradeTable).where(eq(channelGradeTable.id, gradeId)));
  }

  async findByName(gradeName: string, tx: Tx = db): Promise<GradeEnt | null> {
    return oneNullable(await tx.select().from(channelGradeTable).where(eq(channelGradeTable.name, gradeName)));
  }
}
