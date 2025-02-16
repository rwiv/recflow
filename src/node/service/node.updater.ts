import { Injectable } from '@nestjs/common';
import { NodeStateRepository } from '../storage/node-state.repository.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeFinder } from './node.finder.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';
import { NodeUpdate } from '../spec/node.dto.schema.js';
import { NodeRepository } from '../storage/node.repository.js';

export const syncForm = z.array(
  z.object({
    nodeId: uuid,
    pfId: uuid,
  }),
);
export type SyncForm = z.infer<typeof syncForm>;

@Injectable()
export class NodeUpdater {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly stateRepo: NodeStateRepository,
    private readonly finder: NodeFinder,
  ) {}

  async update(id: string, req: NodeUpdate) {
    await this.nodeRepo.update(id, req);
  }

  async updateCnt(nodeId: string, pfId: string, num: 1 | -1, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const states = await this.stateRepo.findByNodeIdAndPlatformIdForUpdate(nodeId, pfId, txx);
      if (!states) {
        throw new NotFoundError(`NodeStates Not found: nodeId=${nodeId}, platformId=${pfId}`);
      }
      if (states.length > 1) {
        throw new ValidationError(`Multiple states found: nodeId=${nodeId}, platformId=${pfId}`);
      }
      const state = states[0];
      if (num === -1 && state.assigned < 1) {
        throw new ValidationError(`Node has no assigned count: nodeId=${nodeId}, platformId=${pfId}`);
      }
      await this.stateRepo.update(state.id, { assigned: state.assigned + num }, txx);
    });
  }

  async synchronize(liveStates: SyncForm) {
    return db.transaction(async (tx) => {
      for (const state of await this.stateRepo.findAll(tx)) {
        await this.stateRepo.update(state.id, { assigned: 0 });
      }

      for (const live of liveStates) {
        const node = await this.finder.findById(live.nodeId);
        if (!node) throw NotFoundError.from('Node', 'id', live.nodeId);
        await this.updateCnt(node.id, live.pfId, 1, tx);
      }
    });
  }
}
