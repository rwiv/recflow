import { Injectable } from '@nestjs/common';
import {
  nodeStateEnt,
  NodeStateEnt,
  NodeStateEntAppend,
  NodeStateEntUpdate,
} from './node.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { nodeStates } from '../../infra/db/schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { and, eq } from 'drizzle-orm';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class NodeStateRepository {
  async create(append: NodeStateEntAppend, tx: Tx = db) {
    const req: NodeStateEnt = {
      ...append,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(nodeStates).values(nodeStateEnt.parse(req)).returning());
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(nodeStates);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeStates).where(eq(nodeStates.id, id)));
  }

  async findByNodeId(nodeId: string, tx: Tx = db) {
    return tx.select().from(nodeStates).where(eq(nodeStates.nodeId, nodeId));
  }

  async findByNodeIdAndPlatformIdForUpdate(nodeId: string, platformId: string, tx: Tx = db) {
    const cond = and(eq(nodeStates.nodeId, nodeId), eq(nodeStates.platformId, platformId));
    return tx.select().from(nodeStates).where(cond).for('update');
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodeStates).where(eq(nodeStates.id, id));
  }

  async update(update: NodeStateEntUpdate, tx: Tx = db) {
    const nodeState = await this.findById(update.id, tx);
    if (!nodeState) throw new NotFoundError('Node state not found');
    const req: NodeStateEnt = {
      ...nodeState,
      ...update.form,
      updatedAt: new Date(),
    };
    return oneNotNull(
      await tx
        .update(nodeStates)
        .set(nodeStateEnt.parse(req))
        .where(eq(nodeStates.id, update.id))
        .returning(),
    );
  }
}
