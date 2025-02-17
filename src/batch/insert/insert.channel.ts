import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { ChannelAppendWithFetch } from '../../channel/spec/channel.dto.schema.js';
import { log } from 'jslog';
import { Injectable } from '@nestjs/common';
import { ChannelBatchInsert } from '../batch.config.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { PriorityService } from '../../channel/service/priority.service.js';

@Injectable()
export class ChannelBatchInserter {
  constructor(
    private readonly channelWriter: ChannelWriter,
    private readonly pfFinder: PlatformFinder,
    private readonly priService: PriorityService,
  ) {}

  async insert(req: ChannelBatchInsert, delay: number) {
    for (const pid of req.pids) {
      const platform = await this.pfFinder.findByNameNotNull(req.platform);
      const priority = await this.priService.findByNameNotNull(req.priority);
      const append: ChannelAppendWithFetch = {
        pid,
        platformId: platform.id,
        priorityId: priority.id,
        isFollowed: false,
        description: null,
        tagNames: req.tagNames.filter((t: string) => t.length > 0),
      };
      await this.channelWriter.createWithFetch(append);
      log.info(`Inserted channel ${pid}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
