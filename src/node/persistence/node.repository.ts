import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { nodes } from '../../infra/db/schema.js';
import { nodeEnt, NodeEnt, NodeEntAppend } from './persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull } from '../../utils/list.js';

@Injectable()
export class NodeRepository {
  async createNode(append: NodeEntAppend, tx: Tx = db): Promise<NodeEnt> {
    const req: NodeEnt = {
      ...append,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(nodes).values(nodeEnt.parse(req)).returning());
  }
}
