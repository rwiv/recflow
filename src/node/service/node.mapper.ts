import { Injectable } from '@nestjs/common';
import { NodeEnt, NodeStateEnt } from '../spec/node.entity.schema.js';
import { NodeDto, NodeStateDto } from '../spec/node.dto.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeGroupRepository } from '../storage/node-group.repository.js';
import { NodeTypeRepository } from '../storage/node-type.repository.js';
import { NodeStateRepository } from '../storage/node-state.repository.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';

@Injectable()
export class NodeMapper {
  constructor(
    private readonly groupRepo: NodeGroupRepository,
    private readonly typeRepo: NodeTypeRepository,
    private readonly stateRepo: NodeStateRepository,
    private readonly pfFinder: PlatformFinder,
  ) {}

  async mapAll(entities: NodeEnt[], withGroup: boolean = false, withStates: boolean = false) {
    return Promise.all(entities.map((ent) => this.map(ent, withGroup, withStates)));
  }

  async map(
    ent: NodeEnt,
    withGroup: boolean = false,
    withStates: boolean = false,
    tx: Tx = db,
  ): Promise<NodeDto> {
    const nodeType = await this.typeRepo.findById(ent.typeId, tx);
    if (!nodeType) throw NotFoundError.from('NodeType', 'id', ent.typeId);
    let result: NodeDto = { ...ent, type: nodeType };
    if (withGroup) {
      const group = await this.groupRepo.findById(ent.groupId, tx);
      if (!group) throw NotFoundError.from('NodeGroup', 'id', ent.groupId);
      result = { ...result, group };
    }
    if (withStates) {
      const stateEntities = await this.stateRepo.findByNodeId(ent.id, tx);
      const states = await Promise.all(stateEntities.map((state) => this.mapState(state, tx)));
      result = { ...result, states };
    }
    return result;
  }

  async mapState(ent: NodeStateEnt, tx: Tx = db): Promise<NodeStateDto> {
    const platform = await this.pfFinder.findByIdNotNull(ent.platformId, tx);
    return { ...ent, platform };
  }
}
