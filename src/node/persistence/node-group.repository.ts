import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { nodeGroupEnt, NodeGroupEnt } from './node.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { nodeGroups } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class NodeGroupRepository {
  async create(name: string, tier: number, tx: Tx = db): Promise<NodeGroupEnt> {
    const req: NodeGroupEnt = {
      id: uuid(),
      name,
      tier,
      createdAt: new Date(),
      updatedAt: null,
    };
    return oneNotNull(await tx.insert(nodeGroups).values(nodeGroupEnt.parse(req)).returning());
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeGroups).where(eq(nodeGroups.id, id)));
  }
}
