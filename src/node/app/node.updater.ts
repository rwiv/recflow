import { Injectable } from '@nestjs/common';
import { NodeStateRepository } from '../storage/node-state.repository.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeFinder } from './node.finder.js';
import { NodeStateEntUpdate } from '../storage/node.entity.schema.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

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
    private readonly stateRepo: NodeStateRepository,
    private readonly finder: NodeFinder,
  ) {}

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
      const update: NodeStateEntUpdate = { id: state.id, form: { assigned: state.assigned + num } };
      await this.stateRepo.update(update, txx);
    });
  }

  async synchronize(liveStates: SyncForm) {
    return db.transaction(async (tx) => {
      for (const state of await this.stateRepo.findAll(tx)) {
        const update: NodeStateEntUpdate = { id: state.id, form: { assigned: 0 } };
        await this.stateRepo.update(update);
      }

      for (const live of liveStates) {
        const node = await this.finder.findById(live.nodeId);
        if (!node) throw NotFoundError.from('Node', 'id', live.nodeId);
        await this.updateCnt(node.id, live.pfId, 1, tx);
      }
    });
  }
}
