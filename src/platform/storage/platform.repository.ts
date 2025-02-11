import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { platformTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { PlatformType, platformType } from './platform.business.schema.js';
import { z } from 'zod';
import { uuid } from '../../utils/uuid.js';
import { platformEnt } from './platform.persistence.schema.js';

export const platformEntAppend = platformEnt
  .partial({ id: true, createdAt: true, updatedAt: true })
  .extend({ name: platformType });
export type PlatformEntAppend = z.infer<typeof platformEntAppend>;

const platformEntAppendReq = platformEnt
  .partial({ updatedAt: true })
  .extend({ name: platformType });
type PlatformEntAppendReq = z.infer<typeof platformEntAppendReq>;

@Injectable()
export class PlatformRepository {
  async create(append: PlatformEntAppend, tx: Tx = db) {
    const entReq: PlatformEntAppendReq = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    return oneNotNull(
      await tx.insert(platformTable).values(platformEntAppendReq.parse(entReq)).returning(),
    );
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(platformTable);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(platformTable).where(eq(platformTable.id, id)));
  }

  async findByName(name: PlatformType, tx: Tx = db) {
    return oneNullable(await tx.select().from(platformTable).where(eq(platformTable.name, name)));
  }
}
