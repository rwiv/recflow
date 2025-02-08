import { Injectable } from '@nestjs/common';
import { ChannelRecord } from './channel.schema.js';
import { TagQueryRepository } from '../persistence/tag.query.js';

@Injectable()
export class ChannelSolver {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  async solveChannels(
    channels: ChannelRecord[],
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    if (!withTags) return channels;
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channel.id),
    }));
    return Promise.all(promises);
  }

  async solveChannel(channels: ChannelRecord, withTags: boolean = false): Promise<ChannelRecord> {
    if (!withTags) return channels;
    return {
      ...channels,
      tags: await this.tagQuery.findTagsByChannelId(channels.id),
    };
  }
}
