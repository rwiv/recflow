import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeTypeAppend, nodeTypeEnt, NodeTypeEnt } from './node.entity.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { nodeTypeTable } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';

const nodeTypeEntAppendReq = nodeTypeEnt.partial({ updatedAt: true });
type NodeTypeEntAppendRequest = z.infer<typeof nodeTypeEntAppendReq>;

@Injectable()
export class NodeTypeRepository {
  async create(append: NodeTypeAppend, tx: Tx = db): Promise<NodeTypeEnt> {
    const req: NodeTypeEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(nodeTypeTable).values(nodeTypeEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeTypeTable).where(eq(nodeTypeTable.id, id)));
  }

  async findByName(name: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeTypeTable).where(eq(nodeTypeTable.name, name)));
  }

  async findAll() {
    return db.select().from(nodeTypeTable);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodeTypeTable).where(eq(nodeTypeTable.id, id));
  }
}
