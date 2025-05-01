import { log } from 'jslog';
import { Injectable } from '@nestjs/common';
import { NodeWriter } from '../../node/service/node.writer.js';
import { NodeBatchInsert } from '../batch.config.js';
import { NodeAppend } from '../../node/spec/node.dto.schema.js';
import { notNull } from '../../utils/null.js';
import { NodeGroupService } from '../../node/service/node-group.service.js';

@Injectable()
export class NodeBatchInserter {
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
