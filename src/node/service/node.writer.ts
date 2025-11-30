import { Injectable } from '@nestjs/common';
import { log } from 'jslog';

import { ConflictError } from '@/utils/errors/errors/ConflictError.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { NodeMapper } from '@/node/service/node.mapper.js';
import { NodeAppend, NodeDto, NodeUpdate } from '@/node/spec/node.dto.schema.js';
import { NodeEntAppend } from '@/node/spec/node.entity.schema.js';
import { LiveNodeRepository } from '@/node/storage/live-node.repository.js';
import { NodeRepository } from '@/node/storage/node.repository.js';

import { LiveRepository } from '@/live/storage/live.repository.js';

@Injectable()
export class NodeWriter {
  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly liveRepo: LiveRepository,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly mapper: NodeMapper,
  ) {}

  async create(append: NodeAppend, withGroup: boolean = false, tx: Tx = db): Promise<NodeDto> {
    const existing = await this.nodeRepo.findByName(append.name);
    if (existing) throw new ConflictError(`Node already exists: name=${append.name}`);

    return tx.transaction(async (tx) => {
      const entAppend: NodeEntAppend = append;
      const nodeEnt = await this.nodeRepo.create(entAppend, tx);
      const record = await this.mapper.map(nodeEnt, { group: withGroup }, tx);
      return { ...record };
    });
  }

  async update(id: string, req: NodeUpdate, tx: Tx = db) {
    await this.nodeRepo.update(id, req, tx);
  }

  async delete(id: string, tx: Tx = db) {
    const exLives = await this.liveRepo.findByNodeId(id);
    if (exLives.length > 0) {
      throw new ConflictError(`Node has assigned resources: id=${id}`);
    }
    await this.nodeRepo.delete(id, tx);
  }

  async resetFailureCntAll() {
    const nodes = await this.nodeRepo.findAll();
    const ps = nodes.map((node) => this.nodeRepo.update(node.id, { failureCnt: 0 }));
    return Promise.all(ps);
  }

  async syncLivesCounts() {
    const promises = [];
    for (const node of await this.nodeRepo.findAll()) {
      const p = db.transaction(async (tx) => {
        const trueLivesCnt = await this.liveNodeRepo.findCountByNodeId(node.id, tx);
        if (node.livesCnt !== trueLivesCnt) {
          log.warn('Node lives count mismatch', { nodeId: node.id, expected: node.livesCnt, actual: trueLivesCnt });
          await this.nodeRepo.update(node.id, { livesCnt: trueLivesCnt }, tx);
        }
      });
      promises.push(p);
    }
    await Promise.all(promises);
  }
}
