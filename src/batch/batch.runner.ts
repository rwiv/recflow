import { ChannelWriter } from '../channel/business/channel.writer.js';
import fs from 'fs';
import { checkType } from '../utils/union.js';
import { CHANNEL_PRIORITIES } from '../channel/priority/consts.js';
import { PLATFORM_TYPES } from '../common/enum.consts.js';
import { ChannelCreation } from '../channel/business/channel.types.js';
import { log } from 'jslog';

interface BatchInsertRequest {
  pids: string[];
  platform: string;
  priority: string;
  tagNames: string[];
}

export class BatchRunner {
  constructor(private readonly channelWriter: ChannelWriter) {}

  async batchInsertChannels(filePath: string, delay: number) {
    const text = await fs.promises.readFile(filePath, 'utf8');
    const breq = JSON.parse(text) as BatchInsertRequest;
    const priority = checkType(breq.priority, CHANNEL_PRIORITIES);
    const platform = checkType(breq.platform, PLATFORM_TYPES);
    if (!priority || !platform) {
      throw Error('Invalid priority or platform');
    }
    for (const pid of breq.pids) {
      const req: ChannelCreation = {
        pid,
        platform,
        priority,
        followed: false,
        description: null,
        tagNames: breq.tagNames.filter((t: string) => t.length > 0),
      };
      await this.channelWriter.createWithFetch(req);
      log.info(`Inserted channel ${pid}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
