import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { z } from 'zod';

import { notNull } from '@/utils/null.js';

import { nnint, nonempty } from '@/common/data/common.schema.js';

import { NodeGroupService } from '@/node/service/node-group.service.js';
import { NodeWriter } from '@/node/service/node.writer.js';
import { NodeAppend } from '@/node/spec/node.dto.schema.js';

const nodeBatchInsert = z.object({
  name: nonempty,
  endpoint: z.string().url(),
  groupName: z.string().nonempty(),
  priority: z.number().int().nonnegative(),
  capacity: nnint,
  isCordoned: z.boolean(),
});
export type NodeBatchInsert = z.infer<typeof nodeBatchInsert>;

@Injectable()
export class DevNodeInserter {
  constructor(
    private readonly nodeWriter: NodeWriter,
    private readonly nodeGroupService: NodeGroupService,
  ) {}

  async insert(batchNodes: NodeBatchInsert[]) {
    const groups = await this.nodeGroupService.findAll();
    for (const batchNode of batchNodes) {
      const group = notNull(groups.find((group) => group.name === batchNode.groupName));
      const append: NodeAppend = {
        ...batchNode,
        groupId: group.id,
      };
      const created = await this.nodeWriter.create(append);
      log.info(`Inserted node: ${created.name}`);
    }
  }
}
