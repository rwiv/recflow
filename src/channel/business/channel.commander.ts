import { ChannelEntCreation } from '../persistence/channel.types.js';
import { ChannelCommandRepository } from '../persistence/channel.command.repository.js';
import { TagCommandRepository } from '../persistence/tag.command.repository.js';
import { db } from '../../infra/db/db.js';
import { ChannelCreation, ChannelRecord, ChannelUpdate } from './channel.types.js';
import { TagRecord } from './tag.types.js';
import { Injectable } from '@nestjs/common';
import { ChannelValidator } from './channel.validator.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { assertNotNull } from '../../utils/null.js';

@Injectable()
export class ChannelCommander {
  constructor(
    private readonly chanCmdRepo: ChannelCommandRepository,
    private readonly tagRepo: TagCommandRepository,
    private readonly validator: ChannelValidator,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async create(req: ChannelEntCreation, reqTagNames: string[]): Promise<ChannelRecord> {
    return db.transaction(async (txx) => {
      const channel = await this.chanCmdRepo.create(req, txx);
      const tags: TagRecord[] = [];
      for (const tagName of reqTagNames) {
        tags.push(await this.tagRepo.attach({ channelId: channel.id, tagName }, txx));
      }
      return {
        ...channel,
        tags,
      };
    });
  }

  async createWithFetch(req: ChannelCreation): Promise<ChannelRecord> {
    req = this.validator.validateCreate(req, req.tagNames);
    const info = assertNotNull(await this.fetcher.fetchChannel(req.ptype, req.pid, false));
    const reqEnt: ChannelEntCreation = {
      ptype: info.ptype,
      pid: info.pid,
      username: info.username,
      profileImgUrl: info.profileImgUrl,
      followerCnt: info.followerCnt,
      priority: req.priority,
      description: req.description,
    };
    return db.transaction(async (txx) => {
      const channel = await this.chanCmdRepo.create(reqEnt, txx);
      const tags: TagRecord[] = [];
      for (const tagName of req.tagNames) {
        tags.push(await this.tagRepo.attach({ channelId: channel.id, tagName }, txx));
      }
      return {
        ...channel,
        tags,
      };
    });
  }

  async update(req: ChannelUpdate): Promise<ChannelRecord> {
    req = this.validator.validateUpdate(req, req.tagNames);
    return db.transaction(async (txx) => {
      const channel = await this.chanCmdRepo.update(req, txx);
      let result: ChannelRecord = { ...channel };
      let tags: TagRecord[] = [];
      if (req.tagNames && req.tagNames.length > 0) {
        tags = await this.tagRepo.applyTags(channel.id, req.tagNames, txx);
        result = { ...result, tags };
      }
      return result;
    });
  }

  async delete(channelId: string): Promise<ChannelRecord> {
    return this.chanCmdRepo.delete(channelId);
  }
}
