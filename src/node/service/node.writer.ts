import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../storage/node.repository.js';
import { NodeTypeRepository } from '../storage/node-type.repository.js';
import { NodeAppend, NodeDto } from '../spec/node.dto.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeEntAppend } from '../spec/node.entity.schema.js';
import { db } from '../../infra/db/db.js';
import { NodeMapper } from './node.mapper.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { LiveRepository } from '../../live/storage/live.repository.js';
import { Tx } from '../../infra/db/types.js';

@Injectable()
export class NodeWriter {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly typeRepo: NodeTypeRepository,
    private readonly liveRepo: LiveRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async create(append: NodeAppend, withGroup: boolean = false, tx: Tx = db): Promise<NodeDto> {
    const nodeType = await this.typeRepo.findByName(append.typeName);
    if (!nodeType) throw NotFoundError.from('NodeType', 'name', append.typeName);
    const existing = await this.nodeRepo.findByName(append.name);
    if (existing) throw new ConflictError(`Node already exists: name=${append.name}`);

    return tx.transaction(async (tx) => {
      const entAppend: NodeEntAppend = { ...append, typeId: nodeType.id };
      const nodeEnt = await this.nodeRepo.create(entAppend, tx);
      const record = await this.mapper.map(nodeEnt, { group: withGroup, lives: false }, tx);
      return { ...record };
    });
  }

  async delete(id: string, tx: Tx = db) {
    const exLives = await this.liveRepo.findByNodeId(id);
    if (exLives.length > 0) {
      throw new ConflictError(`Node has assigned resources: id=${id}`);
    }
    await this.nodeRepo.delete(id, tx);
  }

  async resetFailureCntAll(tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const nodes = await this.nodeRepo.findAllForUpdate(txx);
      const promises = [];
      for (const node of nodes) {
        promises.push(this.nodeRepo.update(node.id, { failureCnt: 0 }, txx));
      }
      return Promise.all(promises);
    });
  }
}
