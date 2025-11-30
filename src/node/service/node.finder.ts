import { Injectable } from '@nestjs/common';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { NodeMapper } from '@/node/service/node.mapper.js';
import { NodeFieldsReq } from '@/node/spec/node.dto.schema.js';
import { NodeDtoMapped } from '@/node/spec/node.dto.schema.mapped.js';
import { NodeRepository } from '@/node/storage/node.repository.js';

@Injectable()
export class NodeFinder {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async findById(id: string, req: NodeFieldsReq, tx: Tx = db) {
    const ent = await this.nodeRepo.findById(id, tx);
    if (!ent) return null;
    return this.mapper.map(ent, req, tx);
  }

  async findByIdForUpdate(id: string, req: NodeFieldsReq, tx: Tx = db) {
    const ent = await this.nodeRepo.findByIdForUpdate(id, tx);
    if (!ent) return null;
    return this.mapper.map(ent, req, tx);
  }

  async findByName(name: string, req: NodeFieldsReq, tx: Tx = db) {
    const ent = await this.nodeRepo.findByName(name);
    if (!ent) return null;
    return this.mapper.map(ent, req, tx);
  }

  async findByGroupId(groupId: string, req: NodeFieldsReq, tx: Tx = db): Promise<NodeDtoMapped[]> {
    const entities = await this.nodeRepo.findByGroupId(groupId, tx);
    return this.mapper.mapAll(entities, req, tx);
  }

  async findByLiveId(liveId: string, req: NodeFieldsReq, tx: Tx = db): Promise<NodeDtoMapped[]> {
    const entities = await this.nodeRepo.findByLiveId(liveId, tx);
    return this.mapper.mapAll(entities, req, tx);
  }

  async findAll(req: NodeFieldsReq, tx: Tx = db): Promise<NodeDtoMapped[]> {
    const entities = await this.nodeRepo.findAll(tx);
    return this.mapper.mapAll(entities, req, tx);
  }
}
