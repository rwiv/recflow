import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { oneNotNull, oneNullable } from '@/utils/list.js';

import { db } from '@/infra/db/db.js';
import { platformTable } from '@/infra/db/schema.js';
import { Tx } from '@/infra/db/types.js';

import { PlatformName, platformNameEnum } from '@/platform/spec/storage/platform.enum.schema.js';
import { PlatformEnt, platformEnt } from '@/platform/storage/platform.entity.schema.js';

export const platformEntAppend = platformEnt
  .partial({ id: true, createdAt: true, updatedAt: true })
  .extend({ name: platformNameEnum });
export type PlatformEntAppend = z.infer<typeof platformEntAppend>;

const platformEntAppendReq = platformEnt.partial({ id: true, updatedAt: true }).extend({ name: platformNameEnum });
type PlatformEntAppendReq = z.infer<typeof platformEntAppendReq>;

@Injectable()
export class PlatformRepository {
  async create(append: PlatformEntAppend, tx: Tx = db): Promise<PlatformEnt> {
    const entReq: PlatformEntAppendReq = {
      ...append,
      id: append.id,
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(platformTable).values(platformEntAppendReq.parse(entReq)).returning();
    return oneNotNull(ent);
  }

  async findAll(tx: Tx = db): Promise<PlatformEnt[]> {
    return tx.select().from(platformTable);
  }

  async findById(id: string, tx: Tx = db): Promise<PlatformEnt | null> {
    return oneNullable(await tx.select().from(platformTable).where(eq(platformTable.id, id)));
  }

  async findByName(name: PlatformName, tx: Tx = db): Promise<PlatformEnt | null> {
    return oneNullable(await tx.select().from(platformTable).where(eq(platformTable.name, name)));
  }
}
