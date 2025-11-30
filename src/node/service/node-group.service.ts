import { Injectable } from '@nestjs/common';

import { NodeGroupAppend, NodeGroupUpdate } from '@/node/spec/node.entity.schema.js';
import { NodeGroupRepository } from '@/node/storage/node-group.repository.js';

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
