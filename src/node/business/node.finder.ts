import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../persistence/node.repository.js';
import { NodeMapper } from './node.mapper.js';
import { NodeGroupRepository } from '../persistence/node-group.repository.js';

@Injectable()
export class NodeFinder {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly groupRepo: NodeGroupRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async findById(id: string, withGroup: boolean = false, withState: boolean = false) {
    const ent = await this.nodeRepo.findById(id);
    if (!ent) return undefined;
    return this.mapper.map(ent, withGroup, withState);
  }

  async findByName(name: string, withGroup: boolean = false, withState: boolean = false) {
    const ent = await this.nodeRepo.findByName(name);
    if (!ent) return undefined;
    return this.mapper.map(ent, withGroup, withState);
  }

  async findAll(withGroup: boolean = false, withState: boolean = false) {
    const entities = await this.nodeRepo.findAll();
    return Promise.all(entities.map((ent) => this.mapper.map(ent, withGroup, withState)));
  }

  async findGroups() {
    return this.groupRepo.findAll();
  }
}
