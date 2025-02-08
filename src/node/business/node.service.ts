import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../persistence/node.repository.js';
import { NodeGroupRepository } from '../persistence/node-group.repository.js';
import { NodeTypeRepository } from '../persistence/node-type.repository.js';
import { NodeStateRepository } from '../persistence/node-state.repository.js';
import { NodeAppend } from './node.business.schema.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';

@Injectable()
export class NodeService {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly groupRepo: NodeGroupRepository,
    private readonly typeRepo: NodeTypeRepository,
    private readonly stateRepo: NodeStateRepository,
    private readonly pfRepo: PlatformRepository,
  ) {}

  async create(append: NodeAppend) {}
}
