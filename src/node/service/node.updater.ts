import { Injectable } from '@nestjs/common';
import { NodeStateRepository } from '../storage/node-state.repository.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { NodeUpdate } from '../spec/node.dto.schema.js';
import { NodeRepository } from '../storage/node.repository.js';
import { NodeStateEnt } from '../spec/node.entity.schema.js';

@Injectable()
export class NodeUpdater {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly stateRepo: NodeStateRepository,
  ) {}

  async update(id: string, req: NodeUpdate) {
    await this.nodeRepo.update(id, req);
  }

  async updateCapacity(nodeId: string, platformId: string, capacity: number, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const states = await this.stateRepo.findByNodeIdAndPlatformIdForUpdate(nodeId, platformId, txx);
      const state = this.validatedState(states, nodeId, platformId);
      await this.stateRepo.update(state.id, { capacity }, txx);
      await this.nodeRepo.setUpdatedAtNow(nodeId, txx);
    });
  }

  private validatedState(states: NodeStateEnt[], nodeId: string, pfId: string) {
    if (!states) {
      throw new NotFoundError(`NodeStates Not found: nodeId=${nodeId}, platformId=${pfId}`);
    }
    if (states.length > 1) {
      throw new ValidationError(`Multiple states found: nodeId=${nodeId}, platformId=${pfId}`);
    }
    return states[0];
  }
}
