import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { liveNodeEnt, LiveNodeEnt, LiveNodeEntAppend } from '../spec/node.entity.schema.js';
import { oneNotNull } from '../../utils/list.js';
import { liveNodeTable } from '../../infra/db/schema.js';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class LiveNodeRepository {
  async create(append: LiveNodeEntAppend, tx: Tx = db): Promise<LiveNodeEnt> {
    const req: LiveNodeEnt = {
      ...append,
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(liveNodeTable).values(liveNodeEnt.parse(req)).returning();
    return oneNotNull(ent);
  }

  async delete(req: { liveId: string; nodeId: string }, tx: Tx = db) {
    const cond = and(eq(liveNodeTable.liveId, req.liveId), eq(liveNodeTable.nodeId, req.nodeId));
    await tx.delete(liveNodeTable).where(cond);
  }
}
