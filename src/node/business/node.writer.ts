import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../persistence/node.repository.js';
import { NodeTypeRepository } from '../persistence/node-type.repository.js';
import { NodeStateRepository } from '../persistence/node-state.repository.js';
import { NodeAppend, NodeRecord, NodeState } from './node.business.schema.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeEntAppend, NodeStateEntAppend } from '../persistence/node.persistence.schema.js';
import { db } from '../../infra/db/db.js';
import { NodeMapper } from './node.mapper.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

@Injectable()
export class NodeWriter {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly typeRepo: NodeTypeRepository,
    private readonly stateRepo: NodeStateRepository,
    private readonly pfRepo: PlatformRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async create(append: NodeAppend, withGroup: boolean = false): Promise<NodeRecord> {
    const nodeType = await this.typeRepo.findByName(append.typeName);
    if (!nodeType) throw new NotFoundError(`"Not found node type: ${append.typeName}"`);

    return db.transaction(async (tx) => {
      const entAppend: NodeEntAppend = { ...append, typeId: nodeType.id };
      const nodeEnt = await this.nodeRepo.create(entAppend, tx);
      const states: NodeState[] = [];
      for (const platform of await this.pfRepo.findAll(tx)) {
        const capacity = append.capacities.find((c) => c.platformName === platform.name)?.capacity;
        if (capacity === undefined) {
          throw new ValidationError(`"${platform.name}" platform is not included in the form`);
        }
        const stateEntAppend: NodeStateEntAppend = {
          nodeId: nodeEnt.id,
          platformId: platform.id,
          capacity,
          assigned: 0,
        };
        const stateEnt = await this.stateRepo.create(stateEntAppend, tx);
        states.push(this.mapper.mapStateWithPlatform(stateEnt, platform));
      }
      const record = await this.mapper.map(nodeEnt, withGroup, false, tx);
      return { ...record, states };
    });
  }

  async delete(id: string) {
    const states = await this.stateRepo.findByNodeId(id);
    return db.transaction(async (tx) => {
      for (const state of states) {
        await this.stateRepo.delete(state.id, tx);
      }
      await this.nodeRepo.delete(id, tx);
    });
  }
}
