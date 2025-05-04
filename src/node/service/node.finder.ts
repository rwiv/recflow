import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../storage/node.repository.js';
import { NodeMapper } from './node.mapper.js';
import { NodeFieldsReq } from '../spec/node.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeDtoWithLives } from '../spec/node.dto.mapped.schema.js';

@Injectable()
export class NodeFinder {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async findById(id: string, req: NodeFieldsReq, tx: Tx = db) {
    const ent = await this.nodeRepo.findById(id, tx);
    if (!ent) return undefined;
    return this.mapper.map(ent, req, tx);
  }

  async findByName(name: string, req: NodeFieldsReq, tx: Tx = db) {
    const ent = await this.nodeRepo.findByName(name);
    if (!ent) return undefined;
    return this.mapper.map(ent, req, tx);
  }

  async findByGroupId(groupId: string, req: NodeFieldsReq, tx: Tx = db): Promise<NodeDtoWithLives[]> {
    const entities = await this.nodeRepo.findByGroupId(groupId, tx);
    return this.mapper.mapAll(entities, req, tx);
  }

  async findByLiveId(liveId: string, req: NodeFieldsReq, tx: Tx = db): Promise<NodeDtoWithLives[]> {
    const entities = await this.nodeRepo.findByLiveId(liveId, tx);
    return this.mapper.mapAll(entities, req, tx);
  }

  async findAll(req: NodeFieldsReq, tx: Tx = db): Promise<NodeDtoWithLives[]> {
    const entities = await this.nodeRepo.findAll(tx);
    return this.mapper.mapAll(entities, req, tx);
  }
}
