import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { platformTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { PlatformName, platformNameEnum } from '../spec/storage/platform.enum.schema.js';
import { z } from 'zod';
import { uuid } from '../../utils/uuid.js';
import { platformEnt } from './platform.entity.schema.js';

export const platformEntAppend = platformEnt
  .partial({ id: true, createdAt: true, updatedAt: true })
  .extend({ name: platformNameEnum });
export type PlatformEntAppend = z.infer<typeof platformEntAppend>;

const platformEntAppendReq = platformEnt.partial({ updatedAt: true }).extend({ name: platformNameEnum });
type PlatformEntAppendReq = z.infer<typeof platformEntAppendReq>;

@Injectable()
export class PlatformRepository {
  async create(append: PlatformEntAppend, tx: Tx = db) {
    const entReq: PlatformEntAppendReq = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(platformTable).values(platformEntAppendReq.parse(entReq)).returning();
    return oneNotNull(ent);
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(platformTable);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(platformTable).where(eq(platformTable.id, id)));
  }

  async findByName(name: PlatformName, tx: Tx = db) {
    return oneNullable(await tx.select().from(platformTable).where(eq(platformTable.name, name)));
  }
}
