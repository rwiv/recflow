import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { oneNotNull, oneNullable } from '@/utils/list.js';

import { db } from '@/infra/db/db.js';
import { nodeGroupTable } from '@/infra/db/schema.js';
import { Tx } from '@/infra/db/types.js';

import { NodeGroupEnt, NodeGroupEntAppend, NodeGroupEntUpdate, nodeGroupEnt } from '@/node/spec/node.entity.schema.js';

const nodeGroupEntAppendReq = nodeGroupEnt.partial({ id: true, description: true, updatedAt: true });
type NodeGroupEntAppendRequest = z.infer<typeof nodeGroupEntAppendReq>;

@Injectable()
export class NodeGroupRepository {
  async create(append: NodeGroupEntAppend, tx: Tx = db): Promise<NodeGroupEnt> {
    const req: NodeGroupEntAppendRequest = {
      ...append,
      id: append.id,
      createdAt: append.createdAt ?? new Date(),
      updatedAt: append.createdAt ?? null,
    };
    const ent = await tx.insert(nodeGroupTable).values(nodeGroupEntAppendReq.parse(req)).returning();
    return oneNotNull(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await tx.delete(nodeGroupTable).where(eq(nodeGroupTable.id, id));
  }

  async update(id: string, update: NodeGroupEntUpdate, tx: Tx = db): Promise<NodeGroupEnt> {
    const nodeGroup = await this.findById(id, tx);
    if (!nodeGroup) throw NotFoundError.from('NodeGroup', 'id', id);
    const req: NodeGroupEnt = {
      ...nodeGroup,
      ...update,
      updatedAt: new Date(),
    };
    const ent = await tx
      .update(nodeGroupTable)
      .set(nodeGroupEnt.parse(req))
      .where(eq(nodeGroupTable.id, id))
      .returning();
    return oneNotNull(ent);
  }

  async findById(id: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeGroupTable).where(eq(nodeGroupTable.id, id)));
  }

  async findByName(name: string, tx: Tx = db) {
    return oneNullable(await tx.select().from(nodeGroupTable).where(eq(nodeGroupTable.name, name)));
  }

  async findAll(tx: Tx = db) {
    return tx.select().from(nodeGroupTable);
  }
}
