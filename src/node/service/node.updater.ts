import { Injectable } from '@nestjs/common';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { NodeUpdate } from '../spec/node.dto.schema.js';
import { NodeRepository } from '../storage/node.repository.js';

@Injectable()
export class NodeUpdater {
  constructor(private readonly nodeRepo: NodeRepository) {}

  async update(id: string, req: NodeUpdate, tx: Tx = db) {
    await this.nodeRepo.update(id, req, tx);
  }

  async setLastAssignedAtNow(id: string, tx: Tx = db) {
    await this.nodeRepo.setLastAssignedAtNow(id, tx);
  }
}
