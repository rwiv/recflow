import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../persistence/node.repository.js';
import { NodeMapper } from './node.mapper.js';

@Injectable()
export class NodeFinder {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async findById(id: string) {
    const ent = await this.nodeRepo.findById(id);
    if (!ent) return undefined;
    return this.mapper.map(ent);
  }
}
