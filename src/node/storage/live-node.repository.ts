import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { ValidationError } from '@/utils/errors/errors/ValidationError.js';
import { oneNotNull } from '@/utils/list.js';

import { db } from '@/infra/db/db.js';
import { liveNodeTable } from '@/infra/db/schema.js';
import { Tx } from '@/infra/db/types.js';

import { LiveNodeEnt, LiveNodeEntAppend, LiveNodeEntUpdate, liveNodeEnt } from '@/node/spec/node.entity.schema.js';

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

  async update(liveId: string, nodeId: string, update: LiveNodeEntUpdate, tx: Tx = db) {
    const req: LiveNodeEnt = {
      liveId,
      nodeId,
      ...update,
    };
    const ent = await tx
      .update(liveNodeTable)
      .set(liveNodeEnt.parse(req))
      .where(and(eq(liveNodeTable.liveId, liveId), eq(liveNodeTable.nodeId, nodeId)))
      .returning();
    return oneNotNull(ent);
  }

  async findCountByNodeId(nodeId: string, tx: Tx = db): Promise<number> {
    return tx.$count(tx.select().from(liveNodeTable).where(eq(liveNodeTable.nodeId, nodeId)));
  }

  async findByLiveIdAndNodeId(liveId: string, nodeId: string, tx: Tx = db): Promise<LiveNodeEnt | null> {
    const entities = await tx
      .select()
      .from(liveNodeTable)
      .where(and(eq(liveNodeTable.liveId, liveId), eq(liveNodeTable.nodeId, nodeId)));
    if (entities.length === 0) {
      return null;
    }
    if (entities.length > 1) {
      throw new ValidationError(`Duplicated live node entities: liveId=${liveId}, nodeId=${nodeId}`);
    }
    return entities[0];
  }
}
