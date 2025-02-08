import { Injectable } from '@nestjs/common';
import { nodeStateEnt, NodeStateEnt, NodeStateEntAppend } from './node.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { nodeStates } from '../../infra/db/schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { eq } from 'drizzle-orm';

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

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeStates).where(eq(nodeStates.id, id)));
  }

  async findByNodeId(nodeId: string, tx: Tx = db) {
    return tx.select().from(nodeStates).where(eq(nodeStates.nodeId, nodeId));
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodeStates).where(eq(nodeStates.id, id));
  }
}
