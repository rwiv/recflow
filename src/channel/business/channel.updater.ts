import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { TagWriter } from './tag.writer.js';
import { ChannelValidator } from './channel.validator.js';
import { Injectable } from '@nestjs/common';
import { ChannelDefUpdate, ChannelRecord, ChannelRecordUpdate } from './channel.types.js';
import { db } from '../../infra/db/db.js';
import { TagRecord } from './tag.types.js';
import { ChannelPriority } from '../priority/types.js';

@Injectable()
export class ChannelUpdater {
  constructor(
    private readonly chanCmd: ChannelCommandRepository,
    private readonly tagWriter: TagWriter,
    private readonly validator: ChannelValidator,
  ) {}

  async updatePriority(id: string, priority: ChannelPriority): Promise<ChannelRecord> {
    return this.updateRecord({ id, form: { priority } });
  }

  async updateFollowed(id: string, followed: boolean): Promise<ChannelRecord> {
    return this.updateRecord({ id, form: { followed } });
  }

  async updateDescription(id: string, description: string | null): Promise<ChannelRecord> {
    return this.updateRecord({ id, form: { description } });
  }

  async updateRecord(req: ChannelDefUpdate): Promise<ChannelRecord> {
    return this.chanCmd.update(this.validator.validateUpdate(req));
  }

  async updateRecordAndTags(req: ChannelRecordUpdate): Promise<ChannelRecord> {
    req = this.validator.validateUpdate(req);
    return db.transaction(async (txx) => {
      const channel = await this.chanCmd.update(req, txx);
      let result: ChannelRecord = { ...channel };
      let tags: TagRecord[] = [];
      if (req.tagNames && req.tagNames.length > 0) {
        tags = await this.tagWriter.applyTags(channel.id, req.tagNames, txx);
        result = { ...result, tags };
      }
      return result;
    });
  }
}
