import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../storage/node.repository.js';
import { NodeMapper } from './node.mapper.js';
import { NodeGroupRepository } from '../storage/node-group.repository.js';
import { NodeDto } from '../spec/node.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';

@Injectable()
export class NodeFinder {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly groupRepo: NodeGroupRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async findById(id: string, withGroup: boolean = false, withStates: boolean = false, tx: Tx = db) {
    const ent = await this.nodeRepo.findById(id, tx);
    if (!ent) return undefined;
    return this.mapper.map(ent, withGroup, withStates, tx);
  }

  async findByName(name: string, withGroup: boolean = false, withStates: boolean = false, tx: Tx = db) {
    const ent = await this.nodeRepo.findByName(name);
    if (!ent) return undefined;
    return this.mapper.map(ent, withGroup, withStates, tx);
  }

  async findByNodeTier(tier: number, tx: Tx = db): Promise<NodeDto[]> {
    const queryResult = await this.nodeRepo.findByNodeTier(tier, tx);
    const promises = queryResult.map(async ([node, group]) => {
      const withOutGroup = await this.mapper.map(node, false, true, tx);
      return { ...withOutGroup, group };
    });
    return Promise.all(promises);
  }

  async findAll(withGroup: boolean = false, withStates: boolean = false) {
    const entities = await this.nodeRepo.findAll();
    return this.mapper.mapAll(entities, withGroup, withStates);
  }

  async findAllGroups() {
    return this.groupRepo.findAll();
  }
}
