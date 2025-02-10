import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { nodeGroups, nodes } from '../../infra/db/schema.js';
import { nodeEnt, NodeEnt, NodeEntAppend, NodeGroupEnt } from './node.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { eq } from 'drizzle-orm';

const nodeEntAppendReq = nodeEnt.partial({ description: true, updatedAt: true });
type NodeEntAppendRequest = z.infer<typeof nodeEntAppendReq>;

@Injectable()
export class NodeRepository {
  async create(append: NodeEntAppend, tx: Tx = db): Promise<NodeEnt> {
    const id = append.id ?? uuid();
    const req: NodeEntAppendRequest = { ...append, id, createdAt: new Date() };
    return oneNotNull(await tx.insert(nodes).values(nodeEntAppendReq.parse(req)).returning());
  }

  async findByNodeTier(tier: number, tx: Tx = db): Promise<[NodeEnt, NodeGroupEnt][]> {
    const records = await tx
      .select()
      .from(nodes)
      .innerJoin(nodeGroups, eq(nodes.groupId, nodeGroups.id))
      .where(eq(nodeGroups.tier, tier));
    return records.map((row) => [row.nodes, row.node_groups]);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodes).where(eq(nodes.id, id)));
  }

  async findByName(name: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodes).where(eq(nodes.name, name)));
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(nodes);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodes).where(eq(nodes.id, id));
  }
}
