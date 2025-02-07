import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { platforms } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../utils/uuid.js';

@Injectable()
export class PlatformRepository {
  async create(name: string, tx: Tx = db) {
    const req = { id: uuid(), name, createdAt: new Date(), updatedAt: null };
    return oneNotNull(await tx.insert(platforms).values(req).returning());
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(platforms);
  }

  async findById(platformId: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(platforms).where(eq(platforms.id, platformId)));
  }

  async findByName(platformName: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(platforms).where(eq(platforms.name, platformName)));
  }
}
