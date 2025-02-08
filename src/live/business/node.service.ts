import { Inject, Injectable } from '@nestjs/common';
import { NodeDef, NodeRecord } from '../../node/types.js';
import { QueryConfig } from '../../common/query.js';
import { PlatformType } from '../../platform/types.js';
import type { AsyncMap } from '../../infra/storage/interface.js';
import { NODE_MAP } from '../persistence/persistence.module.js';
import { QUERY } from '../../common/config.module.js';
import { LiveRecord } from './types.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';

@Injectable()
export class NodeService {
  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    @Inject(NODE_MAP) private readonly map: AsyncMap<string, NodeRecord>,
  ) {}

  clear() {
    return this.map.clear();
  }

  async values(): Promise<NodeRecord[]> {
    await this.syncWithConfig();
    return this.map.values();
  }

  /**
   * 이 메서드는 병렬적으로 호출되면 동시성 이슈를 발생시킨다.
   * TODO: distributed lock을 사용하여 동시성 이슈 해결
   */
  async updateCnt(whName: string, type: PlatformType, num: 1 | -1) {
    const node = await this.map.get(whName);
    if (node === undefined) throw new NotFoundError('Cannot found node');

    let value: NodeRecord;
    if (type === 'chzzk') {
      value = {
        ...node,
        chzzkAssignedCnt: node.chzzkAssignedCnt + num,
        soopAssignedCnt: node.soopAssignedCnt,
      };
    } else if (type === 'soop') {
      value = {
        ...node,
        chzzkAssignedCnt: node.chzzkAssignedCnt,
        soopAssignedCnt: node.soopAssignedCnt + num,
      };
    } else {
      throw new EnumCheckError('Invalid type');
    }
    await this.map.set(whName, value);
  }

  async synchronize(lives: LiveRecord[]) {
    await this.syncWithConfig();
    await this.syncWithLives(lives);
  }

  private async syncWithConfig() {
    const existedEntries = await this.map.entries();

    // Delete nodes that are not assigned
    const toBeDeleted: string[] = [];
    for (const [key, value] of existedEntries) {
      if (!this.query.webhooks.map((it) => it.name).includes(key)) {
        if (value.chzzkAssignedCnt === 0 && value.soopAssignedCnt === 0) {
          toBeDeleted.push(key);
        }
      }
    }

    // Update nodes that are assigned
    const toBeUpdated: [string, NodeRecord][] = [];
    for (const [key, value] of existedEntries) {
      if (this.query.webhooks.map((it: NodeDef) => it.name).includes(key)) {
        const whDef = this.query.webhooks.find((it) => it.name === key);
        if (!whDef) throw new NotFoundError('Cannot found node');
        if (
          value.type !== whDef.type ||
          value.url !== whDef.url ||
          value.chzzkCapacity !== whDef.chzzkCapacity ||
          value.soopCapacity !== whDef.soopCapacity
        ) {
          toBeUpdated.push([key, { ...value, ...whDef }]);
        }
      }
    }

    // Create nodes for newly added
    const toBeCreated: [string, NodeRecord][] = [];
    const keys = existedEntries.map(([key, _]) => key);
    for (const whDef of this.query.webhooks) {
      if (!keys.includes(whDef.name)) {
        const nodes: NodeRecord = {
          ...whDef,
          chzzkAssignedCnt: 0,
          soopAssignedCnt: 0,
        };
        toBeCreated.push([whDef.name, nodes]);
      }
    }

    // Update the map
    await Promise.all(toBeDeleted.map((name) => this.map.delete(name)));
    await Promise.all(toBeUpdated.map(([whName, wh]) => this.map.set(whName, wh)));
    await Promise.all(toBeCreated.map(([whName, whs]) => this.map.set(whName, whs)));
  }

  private async syncWithLives(lives: LiveRecord[]) {
    const whMap = new Map<string, NodeRecord>();
    for (const wh of await this.map.values()) {
      whMap.set(wh.name, {
        ...wh,
        chzzkAssignedCnt: 0,
        soopAssignedCnt: 0,
      });
    }

    for (const live of lives) {
      const wh = whMap.get(live.assignedWebhookName);
      if (!wh) {
        throw new NotFoundError('Cannot found node');
      }

      if (live.type === 'chzzk') {
        wh.chzzkAssignedCnt += 1;
      } else if (live.type === 'soop') {
        wh.soopAssignedCnt += 1;
      } else {
        throw new EnumCheckError('Invalid platform');
      }
    }

    return Promise.all(Array.from(whMap.values()).map((wh) => this.map.set(wh.name, wh)));
  }
}
