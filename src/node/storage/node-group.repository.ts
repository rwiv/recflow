import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeGroupAppend, nodeGroupEnt, NodeGroupEnt } from '../spec/node.entity.schema.js';
import { uuid } from '../../utils/uuid.js';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { nodeGroupTable } from '../../infra/db/schema.js';
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
    const ent = await tx.insert(nodeGroupTable).values(nodeGroupEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeGroupTable).where(eq(nodeGroupTable.id, id)));
  }

  async findByName(name: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeGroupTable).where(eq(nodeGroupTable.name, name)));
  }

  async findByTier(tier: number, tx: Tx = db) {
    return tx.select().from(nodeGroupTable).where(eq(nodeGroupTable.tier, tier));
  }

  async findAll() {
    return db.select().from(nodeGroupTable);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodeGroupTable).where(eq(nodeGroupTable.id, id));
  }
}
