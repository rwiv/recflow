import { ChannelWriter } from '../channel/channel/business/channel.writer.js';
import fs from 'fs';
import {
  ChannelAppendWithFetch,
  chAppendWithFetch,
} from '../channel/channel/business/channel.business.schema.js';
import { log } from 'jslog';
import { platformType } from '../platform/platform.schema.js';

interface BatchInsertRequest {
  pids: string[];
  platform: string;
  priority: string;
  tagNames: string[];
}

export class BatchInserter {
  constructor(private readonly channelWriter: ChannelWriter) {}

  async batchInsertChannels(filePath: string, delay: number) {
    const text = await fs.promises.readFile(filePath, 'utf8');
    const breq = JSON.parse(text) as BatchInsertRequest;
    for (const pid of breq.pids) {
      const req: ChannelAppendWithFetch = {
        pid,
        platformName: platformType.parse(breq.platform),
        priorityName: breq.priority,
        followed: false,
        description: null,
        tagNames: breq.tagNames.filter((t: string) => t.length > 0),
      };
      await this.channelWriter.createWithFetch(chAppendWithFetch.parse(req));
      log.info(`Inserted channel ${pid}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
