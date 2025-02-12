import { log } from 'jslog';
import { Injectable } from '@nestjs/common';
import { NodeWriter } from '../../node/service/node.writer.js';
import { NodeBatchInsert } from '../batch.config.js';
import { NodeAppend } from '../../node/spec/node.dto.schema.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { notNull } from '../../utils/null.js';

@Injectable()
export class NodeBatchInserter {
  constructor(
    private readonly nodeWriter: NodeWriter,
    private readonly nodeFinder: NodeFinder,
  ) {}

  async insert(batchNodes: NodeBatchInsert[]) {
    const groups = await this.nodeFinder.findAllGroups();
    for (const batchNode of batchNodes) {
      const group = notNull(groups.find((group) => group.name === batchNode.groupName));
      const append: NodeAppend = {
        ...batchNode,
        // isCordoned: randomElem([true, false]),
        groupId: group.id,
        capacities: [
          { platformName: 'chzzk', capacity: batchNode.capacities.chzzk },
          { platformName: 'soop', capacity: batchNode.capacities.soop },
          { platformName: 'twitch', capacity: batchNode.capacities.twitch },
        ],
      };
      const created = await this.nodeWriter.create(append);
      log.info(`Inserted node: ${created.name}`);
    }
  }
}
