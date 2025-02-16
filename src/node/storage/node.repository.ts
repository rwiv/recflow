import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { nodeGroupTable, nodeTable } from '../../infra/db/schema.js';
import { nodeEnt, NodeEnt, NodeEntAppend, NodeEntUpdate, NodeGroupEnt } from '../spec/node.entity.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

const nodeEntAppendReq = nodeEnt.partial({ description: true, updatedAt: true });
type NodeEntAppendRequest = z.infer<typeof nodeEntAppendReq>;

@Injectable()
export class NodeRepository {
  async create(append: NodeEntAppend, tx: Tx = db) {
    const req: NodeEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      isCordoned: append.isCordoned ?? false,
      createdAt: append.createdAt ?? new Date(),
    };
    const ent = await tx.insert(nodeTable).values(nodeEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async findByNodeTier(tier: number, tx: Tx = db): Promise<[NodeEnt, NodeGroupEnt][]> {
    const records = await tx
      .select()
      .from(nodeTable)
      .innerJoin(nodeGroupTable, eq(nodeTable.groupId, nodeGroupTable.id))
      .where(eq(nodeGroupTable.tier, tier));
    return records.map((row) => [row.node, row.node_group]);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeTable).where(eq(nodeTable.id, id)));
  }

  async findByName(name: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeTable).where(eq(nodeTable.name, name)));
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(nodeTable);
  }

  async update(id: string, update: NodeEntUpdate, tx: Tx = db) {
    const node = await this.findById(id, tx);
    if (!node) throw NotFoundError.from('NodeEnt', 'id', id);
    const req: NodeEnt = {
      ...node,
      ...update,
      updatedAt: new Date(),
    };
    const ent = await tx.update(nodeTable).set(nodeEnt.parse(req)).where(eq(nodeTable.id, id)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodeTable).where(eq(nodeTable.id, id));
  }
}
