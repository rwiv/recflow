import { NodeGroupRepository } from '../storage/node-group.repository.js';
import { Injectable } from '@nestjs/common';
import { NodeGroupAppend, NodeGroupUpdate } from '../spec/node.entity.schema.js';

@Injectable()
export class NodeGroupService {
  constructor(private readonly nodeGroupRepository: NodeGroupRepository) {}

  findAll() {
    return this.nodeGroupRepository.findAll();
  }

  create(append: NodeGroupAppend) {
    return this.nodeGroupRepository.create(append);
  }

  delete(id: string) {
    return this.nodeGroupRepository.delete(id);
  }

  update(id: string, update: NodeGroupUpdate) {
    return this.nodeGroupRepository.update(id, update);
  }
}
