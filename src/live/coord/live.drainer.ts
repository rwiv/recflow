import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { z } from 'zod';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { ValidationError } from '@/utils/errors/errors/ValidationError.js';
import { stacktrace } from '@/utils/errors/utils.js';
import { delay } from '@/utils/time.js';

import { liveAttr } from '@/common/attr/attr.live.js';
import { nonempty } from '@/common/data/common.schema.js';

import { Recnode } from '@/external/recnode/client/recnode.client.js';
import { RecnodeRedis } from '@/external/recnode/redis/recnode.redis.js';

import { NodeGroupService } from '@/node/service/node-group.service.js';
import { NodeFinder } from '@/node/service/node.finder.js';
import { NodeWriter } from '@/node/service/node.writer.js';
import { NodeDto } from '@/node/spec/node.dto.schema.js';

import { LiveFinder } from '@/live/data/live.finder.js';
import { LiveRegistrar } from '@/live/register/live.registrar.js';
import { LiveDto } from '@/live/spec/live.dto.schema.js';

const RECORDING_CLOSE_WAIT_TIMEOUT_MS = 60 * 1000; // 1 min
const RECORDING_CLOSE_INTERVAL_DELAY_MS = 1000; // 1 sec

export const drainArgs = z.object({
  groupId: nonempty.optional(),
  nodeId: nonempty.optional(),
});
export type DrainArgs = z.infer<typeof drainArgs>;

@Injectable()
export class LiveDrainer {
  constructor(
    private readonly liveRegistrar: LiveRegistrar,
    private readonly liveFinder: LiveFinder,
    private readonly nodeFinder: NodeFinder,
    private readonly nodeGroupService: NodeGroupService,
    private readonly nodeWriter: NodeWriter,
    private readonly recnode: Recnode,
    private readonly recnodeRedis: RecnodeRedis,
  ) {}

  async drain(args: DrainArgs) {
    if (args.groupId) {
      return this.drainNodeGroup(args.groupId);
    }
    if (args.nodeId) {
      return this.drainNode(args.nodeId);
    }
    throw new ValidationError('Invalid arguments');
  }

  async drainNodeGroup(groupId: string) {
    const groups = await this.nodeGroupService.findAll();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw NotFoundError.from('NodeGroup', 'name', groupId);

    const targetNodes = await this.nodeFinder.findByGroupId(group.id, {});
    if (targetNodes.length === 0) {
      log.debug(`No nodes to drain`, { groupId, groupName: group.name });
      return;
    }

    await Promise.all(targetNodes.map((node) => this.nodeWriter.update(node.id, { isCordoned: true })));
    await Promise.all(targetNodes.map((node) => this.drainNode(node.id)));
    log.info(`Node group drain completed`, { group_id: groupId, group_name: group.name });
  }

  async drainNode(nodeId: string) {
    const node = await this.nodeFinder.findById(nodeId, {});
    if (!node) {
      log.error(`Node not found`, { nodeId });
      return;
    }

    try {
      const lives = await this.liveFinder.findByNodeId(node.id);
      if (lives.length === 0) {
        log.debug(`No lives to drain`, { node_id: nodeId });
        return;
      }

      for (const live of lives) {
        await this.drainByLive(live, node);
      }
      for (const live of lives) {
        await this.waitForCanceled(live, node);
      }
      log.info(`Node drain completed`, { group_id: node.groupId, node_id: nodeId, node_name: node.name });
    } catch (e) {
      log.error(`Failed to drain live`, { node_id: nodeId, stack_trace: stacktrace(e) });
    }
  }

  async drainByLive(reqLive: LiveDto, node: NodeDto) {
    const live = await this.liveFinder.findById(reqLive.id); // latest live dto
    if (!live) {
      log.error(`Live not found`, liveAttr(reqLive, { node }));
      return;
    }

    // Skip already finished live
    if (live.isDisabled) {
      log.error('Live is disabled', liveAttr(live));
      return;
    }

    // Skip if live is invalid
    if (await this.recnodeRedis.isInvalidLive(live)) {
      log.error(`Live is invalid`, liveAttr(live));
      return;
    }

    try {
      await this.liveRegistrar.deregister(live, node);
      log.debug(`Live drain completed`, liveAttr(live, { node }));
    } catch (err) {
      log.error(`Failed to drain live`, liveAttr(live, { node, err }));
    }
  }

  private async waitForRecording(live: LiveDto, node: NodeDto) {
    return this.waitForRecorder(live, node, true);
  }

  private async waitForCanceled(live: LiveDto, node: NodeDto) {
    return this.waitForRecorder(live, node, false);
  }

  private async waitForRecorder(live: LiveDto, node: NodeDto, exists: boolean): Promise<boolean> {
    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > RECORDING_CLOSE_WAIT_TIMEOUT_MS) {
        log.error(`Timeout while waiting for recording to finish`, liveAttr(live));
        return false;
      }

      if (await this.recnodeRedis.isInvalidLive(live)) {
        log.error(`Live is invalid`, liveAttr(live));
        return false;
      }

      const status = await this.recnode.findStatus(node.endpoint, live.id);
      if (exists && status) {
        return true;
      }
      if (!exists && !status) {
        return true;
      }

      await delay(RECORDING_CLOSE_INTERVAL_DELAY_MS);
    }
  }
}
