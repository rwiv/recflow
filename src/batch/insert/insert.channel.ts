import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { ChannelAppendWithFetch } from '../../channel/channel/business/channel.business.schema.js';
import { log } from 'jslog';
import { Injectable } from '@nestjs/common';
import { ChannelBatchInsert } from '../batch.config.js';

@Injectable()
export class ChannelBatchInserter {
  constructor(private readonly channelWriter: ChannelWriter) {}

  async insert(req: ChannelBatchInsert, delay: number) {
    for (const pid of req.pids) {
      const append: ChannelAppendWithFetch = {
        pid,
        platformName: req.platform,
        priorityName: req.priority,
        followed: false,
        description: null,
        tagNames: req.tagNames.filter((t: string) => t.length > 0),
      };
      await this.channelWriter.createWithFetch(append);
      log.info(`Inserted channel ${pid}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
