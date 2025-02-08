import { Injectable } from '@nestjs/common';
import { NodeEnt } from '../persistence/node.persistence.schema.js';
import { NodeRecord } from './node.business.schema.js';
import { notNull } from '../../utils/null.js';
import { nodeTypeEnum } from '../node.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeGroupRepository } from '../persistence/node-group.repository.js';
import { NodeTypeRepository } from '../persistence/node-type.repository.js';
import { NodeStateRepository } from '../persistence/node-state.repository.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';

@Injectable()
export class NodeMapper {
  constructor(
    private readonly groupRepo: NodeGroupRepository,
    private readonly typeRepo: NodeTypeRepository,
    private readonly stateRepo: NodeStateRepository,
  ) {}

  async map(
    ent: NodeEnt,
    withGroup: boolean = false,
    withStates: boolean = false,
    tx: Tx = db,
  ): Promise<NodeRecord> {
    const typeName = notNull(await this.typeRepo.findById(ent.typeId, tx)).name;
    let result: NodeRecord = {
      ...ent,
      typeName: nodeTypeEnum.parse(typeName),
    };
    if (withGroup) {
      const group = await this.groupRepo.findById(ent.groupId, tx);
      if (!group) throw new NotFoundError('node group not found');
      result = { ...result, group };
    }
    if (withStates) {
      const states = await this.stateRepo.findByNodeId(ent.id, tx);
      result = { ...result, states };
    }
    return result;
  }
}
