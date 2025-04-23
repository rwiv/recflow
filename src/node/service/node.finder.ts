import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../storage/node.repository.js';
import { NodeMapper } from './node.mapper.js';
import { NodeGroupRepository } from '../storage/node-group.repository.js';
import { NodeDto, NodeFieldsReq, NodeGroupDto } from '../spec/node.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';

@Injectable()
export class NodeFinder {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly groupRepo: NodeGroupRepository,
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

  async findByLiveId(liveId: string, req: NodeFieldsReq, tx: Tx = db): Promise<NodeDto[]> {
    const entities = await this.nodeRepo.findByLiveId(liveId, tx);
    return this.mapper.mapAll(entities, req, tx);
  }

  async findByNodeGteTier(tier: number, tx: Tx = db): Promise<NodeDto[]> {
    const queryResult = await this.nodeRepo.findByNodeGteTier(tier, tx);
    const promises = queryResult.map(async ([node, group]) => {
      const withOutGroup = await this.mapper.map(node, { group: false, states: true }, tx);
      return { ...withOutGroup, group };
    });
    return Promise.all(promises);
  }

  async findAll(req: NodeFieldsReq, tx: Tx = db): Promise<NodeDto[]> {
    const entities = await this.nodeRepo.findAll(tx);
    return this.mapper.mapAll(entities, req, tx);
  }

  async findAllGroups(tx: Tx = db): Promise<NodeGroupDto[]> {
    return this.groupRepo.findAll(tx);
  }
}
