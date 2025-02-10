import { Injectable } from '@nestjs/common';
import { NodeEnt, NodeStateEnt } from '../persistence/node.persistence.schema.js';
import { NodeRecord, NodeState } from './node.business.schema.js';
import { notNull } from '../../utils/null.js';
import { nodeTypeEnum } from '../node.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeGroupRepository } from '../persistence/node-group.repository.js';
import { NodeTypeRepository } from '../persistence/node-type.repository.js';
import { NodeStateRepository } from '../persistence/node-state.repository.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { PlatformEnt } from '../../platform/persistence/platform.schema.js';
import { platformRecord } from '../../platform/platform.schema.js';

@Injectable()
export class NodeMapper {
  constructor(
    private readonly groupRepo: NodeGroupRepository,
    private readonly typeRepo: NodeTypeRepository,
    private readonly stateRepo: NodeStateRepository,
    private readonly pfRepo: PlatformRepository,
  ) {}

  async mapAll(entities: NodeEnt[], withGroup: boolean = false, withStates: boolean = false) {
    return Promise.all(entities.map((ent) => this.map(ent, withGroup, withStates)));
  }

  async map(
    ent: NodeEnt,
    withGroup: boolean = false,
    withStates: boolean = false,
    tx: Tx = db,
  ): Promise<NodeRecord> {
    const nodeType = notNull(await this.typeRepo.findById(ent.typeId, tx));
    let result: NodeRecord = { ...ent, type: nodeType };
    if (withGroup) {
      const group = await this.groupRepo.findById(ent.groupId, tx);
      if (!group) throw new NotFoundError('Not found node group');
      result = { ...result, group };
    }
    if (withStates) {
      const stateEntities = await this.stateRepo.findByNodeId(ent.id, tx);
      const states = await Promise.all(stateEntities.map((state) => this.mapState(state, tx)));
      result = { ...result, states };
    }
    return result;
  }

  async mapState(ent: NodeStateEnt, tx: Tx = db): Promise<NodeState> {
    const platform = notNull(await this.pfRepo.findById(ent.platformId, tx));
    return this.mapStateWithPlatform(ent, platform);
  }

  mapStateWithPlatform(ent: NodeStateEnt, platform: PlatformEnt): NodeState {
    return { ...ent, platform: platformRecord.parse(platform) };
  }
}
