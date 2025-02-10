import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeGroupAppend, nodeGroupEnt, NodeGroupEnt } from './node.persistence.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { nodeGroups } from '../../infra/db/schema.js';
import { eq } from 'drizzle-orm';

const nodeGroupEntAppendReq = nodeGroupEnt.partial({ description: true, updatedAt: true });
type NodeGroupEntAppendRequest = z.infer<typeof nodeGroupEntAppendReq>;

@Injectable()
export class NodeGroupRepository {
  async create(append: NodeGroupAppend, tx: Tx = db): Promise<NodeGroupEnt> {
    const req: NodeGroupEntAppendRequest = {
      ...append,
      id: append.id ?? uuid(),
      createdAt: append.createdAt ?? new Date(),
      updatedAt: append.createdAt ?? null,
    };
    const ent = await tx.insert(nodeGroups).values(nodeGroupEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeGroups).where(eq(nodeGroups.id, id)));
  }

  async findByName(name: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeGroups).where(eq(nodeGroups.name, name)));
  }

  async findByTier(tier: number, tx: Tx = db) {
    return tx.select().from(nodeGroups).where(eq(nodeGroups.tier, tier));
  }

  async findAll() {
    return db.select().from(nodeGroups);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodeGroups).where(eq(nodeGroups.id, id));
  }
}
