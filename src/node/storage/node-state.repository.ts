import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import {
  nodeStateEnt,
  NodeStateEnt,
  NodeStateEntAppend,
  NodeStateEntUpdate,
} from '../spec/node.entity.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { nodeStateTable } from '../../infra/db/schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { and, eq } from 'drizzle-orm';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

const nodeStateEntAppendReq = nodeStateEnt.partial({ updatedAt: true });
type NodeStateEntAppendRequest = z.infer<typeof nodeStateEntAppendReq>;

@Injectable()
export class NodeStateRepository {
  async create(append: NodeStateEntAppend, tx: Tx = db) {
    const req: NodeStateEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(nodeStateTable).values(nodeStateEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(nodeStateTable);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeStateTable).where(eq(nodeStateTable.id, id)));
  }

  async findByNodeId(nodeId: string, tx: Tx = db) {
    return tx.select().from(nodeStateTable).where(eq(nodeStateTable.nodeId, nodeId));
  }

  async findByNodeIdAndPlatformIdForUpdate(nodeId: string, platformId: string, tx: Tx = db) {
    const cond = and(eq(nodeStateTable.nodeId, nodeId), eq(nodeStateTable.platformId, platformId));
    return tx.select().from(nodeStateTable).where(cond).for('update');
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodeStateTable).where(eq(nodeStateTable.id, id));
  }

  async update(id: string, update: NodeStateEntUpdate, tx: Tx = db) {
    const nodeState = await this.findById(id, tx);
    if (!nodeState) throw NotFoundError.from('NodeState', 'id', id);
    const req: NodeStateEnt = {
      ...nodeState,
      ...update,
      updatedAt: new Date(),
    };
    return oneNotNull(
      await tx
        .update(nodeStateTable)
        .set(nodeStateEnt.parse(req))
        .where(eq(nodeStateTable.id, id))
        .returning(),
    );
  }
}
