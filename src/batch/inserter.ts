import { ChannelWriter } from '../channel/business/channel.writer.js';
import fs from 'fs';
import { checkEnum } from '../utils/union.js';
import { PLATFORM_TYPES } from '../common/enum.consts.js';
import { ChannelCreation } from '../channel/business/channel.types.js';
import { log } from 'jslog';
import { CHANNEL_PRIORITIES } from '../channel/priority/consts.js';
import { assertNotNull } from '../utils/null.js';

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
      const req: ChannelCreation = {
        pid,
        platform: assertNotNull(checkEnum(breq.platform, PLATFORM_TYPES)),
        priority: assertNotNull(checkEnum(breq.priority, CHANNEL_PRIORITIES)),
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
