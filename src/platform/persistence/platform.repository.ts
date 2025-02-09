import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { platforms } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';
import { uuid } from '../../utils/uuid.js';
import { platformEnt, PlatformEnt } from './platform.schema.js';
import { PlatformType } from '../platform.schema.js';

@Injectable()
export class PlatformRepository {
  async create(name: string, tx: Tx = db): Promise<PlatformEnt> {
    const append: PlatformEnt = { id: uuid(), name, createdAt: new Date(), updatedAt: null };
    return oneNotNull(await tx.insert(platforms).values(platformEnt.parse(append)).returning());
  }

  async findAll(tx: Tx = db): Promise<PlatformEnt[]> {
    return tx.select().from(platforms);
  }

  async findById(platformId: string, tx: Tx = db): Promise<PlatformEnt | undefined> {
    return oneNullable(await tx.select().from(platforms).where(eq(platforms.id, platformId)));
  }

  async findByName(platformName: PlatformType, tx: Tx = db): Promise<PlatformEnt | undefined> {
    return oneNullable(await tx.select().from(platforms).where(eq(platforms.name, platformName)));
  }
}
