import { Inject, Injectable } from '@nestjs/common';
import { AMQP_HTTP } from '../../infra/infra.module.js';
import { AmqpHttp } from '../../infra/amqp/amqp.interface.js';
import { AMQP_EXIT_QUEUE_PREFIX } from '../../common/data/constants.js';
import { LiveFinder } from '../access/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { MissingValueError } from '../../utils/errors/errors/MissingValueError.js';
import { LiveEventListener } from '../event/listener.js';
import { LiveWriter } from '../access/live.writer.js';
import { NodeSelector } from '../../node/service/node.selector.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { log } from 'jslog';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';

@Injectable()
export class LiveRecoveryManager {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(AMQP_HTTP) private readonly amqpHttp: AmqpHttp,
    private readonly liveFinder: LiveFinder,
    private readonly liveWriter: LiveWriter,
    private readonly nodeUpdater: NodeUpdater,
    private readonly nodeSelector: NodeSelector,
    private readonly listener: LiveEventListener,
  ) {}

  async check(tx: Tx = db) {
    for (const invalidLive of await this.findInvalidLives()) {
      await tx.transaction(async (txx) => {
        if (!invalidLive.nodeId) {
          throw new MissingValueError(`nodeId is missing: ${invalidLive.id}`);
        }
        await this.nodeUpdater.update(invalidLive.nodeId, { isCordoned: true }, txx);
        const newNode = await this.nodeSelector.match(invalidLive.channel, txx);
        if (!newNode) {
          throw NotFoundError.from('Node', 'id', invalidLive.nodeId);
        }
        const updated = await this.liveWriter.update(invalidLive.id, { nodeId: newNode.id }, txx);
        await this.nodeUpdater.setLastAssignedAtNow(newNode.id, txx);
        await this.listener.onCreate(newNode.endpoint, invalidLive);
        log.info('LiveChecker: recovered', {
          channelName: updated.channel.username,
          nodeName: newNode.name,
        });
      });
    }
  }

  private async findInvalidLives() {
    const prefix = AMQP_EXIT_QUEUE_PREFIX;
    const queues = await this.amqpHttp.fetchByPattern(`${prefix}.*`);
    const invalidLives: LiveDto[] = [];
    for (const live of await this.liveFinder.findAllActives()) {
      const queueName = `${prefix}.${live.platform.name}.${live.channel.pid}`;
      if (!queues.find((q) => q.name === queueName)) {
        invalidLives.push(live);
      }
    }
    const threshold = new Date(Date.now() - this.env.liveRecoveryWaitTimeMs);
    return invalidLives.filter((live) => live.createdAt < threshold);
  }
}
