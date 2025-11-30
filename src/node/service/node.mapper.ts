import { Injectable } from '@nestjs/common';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { NodeDto, NodeFieldsReq } from '@/node/spec/node.dto.schema.js';
import { NodeEnt } from '@/node/spec/node.entity.schema.js';
import { NodeGroupRepository } from '@/node/storage/node-group.repository.js';

@Injectable()
export class NodeMapper {
  constructor(private readonly groupRepo: NodeGroupRepository) {}

  async mapAll(entities: NodeEnt[], req: NodeFieldsReq, tx: Tx = db): Promise<NodeDto[]> {
    return Promise.all(entities.map((ent) => this.map(ent, req, tx)));
  }

  async map(ent: NodeEnt, req: NodeFieldsReq, tx: Tx = db): Promise<NodeDto> {
    let result: NodeDto = ent;
    if (req.group) {
      const group = await this.groupRepo.findById(ent.groupId, tx);
      if (!group) throw NotFoundError.from('NodeGroup', 'id', ent.groupId);
      result = { ...result, group };
    }
    return result;
  }
}
