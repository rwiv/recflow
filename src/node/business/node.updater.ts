import { Injectable } from '@nestjs/common';
import { NodeStateRepository } from '../persistence/node-state.repository.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { PlatformType, platformTypeEnum } from '../../platform/platform.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeFinder } from './node.finder.js';
import { NodeStateEntUpdate } from '../persistence/node.persistence.schema.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const syncForm = z.array(
  z.object({
    nodeId: uuid,
    pfName: platformTypeEnum,
  }),
);
export type SyncForm = z.infer<typeof syncForm>;

@Injectable()
export class NodeUpdater {
  constructor(
    private readonly stateRepo: NodeStateRepository,
    private readonly pfRepo: PlatformRepository,
    private readonly finder: NodeFinder,
  ) {}

  async updateCnt(nodeId: string, pfName: PlatformType, num: 1 | -1, tx: Tx = db) {
    const pf = await this.pfRepo.findByName(pfName);
    if (!pf) throw new NotFoundError(`Platform ${pfName} not found`);
    return this.updateCntByPlatformId(nodeId, pf.id, num, tx);
  }

  async updateCntByPlatformId(nodeId: string, pfId: string, num: 1 | -1, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const states = await this.stateRepo.findByNodeIdAndPlatformIdForUpdate(nodeId, pfId, txx);
      if (!states) {
        throw new NotFoundError(`Node state not found for node ${nodeId} and platform ${pfId}`);
      }
      if (states.length > 1) {
        throw new ValidationError(`Multiple states found for node ${nodeId} and platform ${pfId}`);
      }
      const state = states[0];
      if (num === -1 && state.assigned < 1) {
        throw new ValidationError(`Node ${nodeId} has no assigned count for platform ${pfId}`);
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
        if (!node) throw new NotFoundError(`Node ${live.nodeId} not found`);
        await this.updateCnt(node.id, live.pfName, 1, tx);
      }
    });
  }
}
