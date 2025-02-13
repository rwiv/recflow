import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../storage/node.repository.js';
import { NodeTypeRepository } from '../storage/node-type.repository.js';
import { NodeStateRepository } from '../storage/node-state.repository.js';
import { NodeAppend, NodeDto, NodeStateDto } from '../spec/node.dto.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeEntAppend, NodeStateEntAppend } from '../storage/node.entity.schema.js';
import { db } from '../../infra/db/db.js';
import { NodeMapper } from './node.mapper.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { LiveRepository } from '../../live/storage/live.repository.js';

@Injectable()
export class NodeWriter {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly typeRepo: NodeTypeRepository,
    private readonly stateRepo: NodeStateRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly liveRepo: LiveRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async create(append: NodeAppend, withGroup: boolean = false): Promise<NodeDto> {
    const nodeType = await this.typeRepo.findByName(append.typeName);
    if (!nodeType) throw NotFoundError.from('NodeType', 'name', append.typeName);
    const existing = await this.nodeRepo.findByName(append.name);
    if (existing) throw new ConflictError(`Node already exists: name=${append.name}`);

    return db.transaction(async (tx) => {
      const entAppend: NodeEntAppend = { ...append, typeId: nodeType.id };
      const nodeEnt = await this.nodeRepo.create(entAppend, tx);
      const states: NodeStateDto[] = [];
      for (const platform of await this.pfFinder.findAll(tx)) {
        const capacity = append.capacities.find((c) => c.platformName === platform.name)?.capacity;
        if (capacity === undefined) {
          throw new ValidationError(`"${platform.name}" platform capacity is not included in form`);
        }
        const stateEntAppend: NodeStateEntAppend = {
          nodeId: nodeEnt.id,
          platformId: platform.id,
          capacity,
          assigned: 0,
        };
        const stateEnt = await this.stateRepo.create(stateEntAppend, tx);
        states.push({ ...stateEnt, platform });
      }
      const record = await this.mapper.map(nodeEnt, withGroup, false, tx);
      return { ...record, states };
    });
  }

  async delete(id: string) {
    const exLives = await this.liveRepo.findByNodeId(id);
    if (exLives.length > 0) {
      throw new ConflictError(`Node has assigned resources: id=${id}`);
    }
    const states = await this.stateRepo.findByNodeId(id);
    return db.transaction(async (tx) => {
      await Promise.all(states.map((state) => this.stateRepo.delete(state.id, tx)));
      await this.nodeRepo.delete(id, tx);
    });
  }
}
