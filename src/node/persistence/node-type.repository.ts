import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { nodeTypeEnt, NodeTypeEnt } from './node.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { nodeTypes } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class NodeTypeRepository {
  async create(name: string, tx: Tx = db): Promise<NodeTypeEnt> {
    const req: NodeTypeEnt = {
      id: uuid(),
      name,
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(nodeTypes).values(nodeTypeEnt.parse(req)).returning());
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeTypes).where(eq(nodeTypes.id, id)));
  }
}
