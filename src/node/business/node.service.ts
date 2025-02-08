import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../persistence/node.repository.js';
import { NodeTypeRepository } from '../persistence/node-type.repository.js';
import { NodeStateRepository } from '../persistence/node-state.repository.js';
import { NodeAppend, NodeRecord } from './node.business.schema.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import {
  NodeEntAppend,
  NodeStateEnt,
  NodeStateEntAppend,
} from '../persistence/node.persistence.schema.js';
import { db } from '../../infra/db/db.js';
import { NodeMapper } from './node.mapper.js';

@Injectable()
export class NodeService {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly typeRepo: NodeTypeRepository,
    private readonly stateRepo: NodeStateRepository,
    private readonly pfRepo: PlatformRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async create(append: NodeAppend, withGroup: boolean = false): Promise<NodeRecord> {
    const type = await this.typeRepo.findByName(append.typeName);
    if (!type) throw new NotFoundError('node type not found');
    const entAppend: NodeEntAppend = { ...append, typeId: type.id };

    return db.transaction(async (tx) => {
      const ent = await this.nodeRepo.create(entAppend, tx);
      const platforms = await this.pfRepo.findAll(tx);
      const states: NodeStateEnt[] = [];
      for (const platform of platforms) {
        const map = new Map(append.capacityMap.map((c) => [c.name, c.capacity]));
        const capacity = map.get(platform.name);
        if (capacity === undefined) {
          throw new NotFoundError(`"${platform.name}" capacity not found`);
        }
        const stateEntAppend: NodeStateEntAppend = {
          nodeId: ent.id,
          platformId: platform.id,
          capacity,
          assigned: 0,
        };
        states.push(await this.stateRepo.create(stateEntAppend, tx));
      }
      const record = await this.mapper.map(ent, withGroup, false, tx);
      return { ...record, states };
    });
  }
}
