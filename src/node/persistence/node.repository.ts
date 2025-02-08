import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { nodes } from '../../infra/db/schema.js';
import { nodeEnt, NodeEnt, NodeEntAppend } from './node.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class NodeRepository {
  async create(append: NodeEntAppend, tx: Tx = db): Promise<NodeEnt> {
    const req: NodeEnt = {
      ...append,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(nodes).values(nodeEnt.parse(req)).returning());
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodes).where(eq(nodes.id, id)));
  }
}
