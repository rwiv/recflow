import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { PlatformType } from '../../platform/types.js';
import { ChannelMapper } from './channel.mapper.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { ChannelSolver } from './channel.solver.js';

@Injectable()
export class ChannelFinder {
  constructor(
    private readonly chQuery: ChannelQueryRepository,
    private readonly chMapper: ChannelMapper,
    private readonly tagQuery: TagQueryRepository,
    private readonly solver: ChannelSolver,
  ) {}

  async findAll(withTags: boolean = false) {
    const entities = await this.chQuery.findAll();
    const records = await this.chMapper.mapAll(entities);
    return this.solver.solveChannels(records, withTags);
  }

  async findById(channelId: string, withTags: boolean = false) {
    const ent = await this.chQuery.findById(channelId);
    const channel = await this.chMapper.mapNullable(ent);
    if (!channel) return undefined;
    if (!withTags) return channel;
    return {
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channelId),
    };
  }

  async findByPid(pid: string, withTags: boolean = false) {
    const entities = await this.chQuery.findByPid(pid);
    const channels = await this.chMapper.mapAll(entities);
    return this.solver.solveChannels(channels, withTags);
  }

  async findByPidOne(pid: string, platform: PlatformType, withTags: boolean = false) {
    const entities = await this.chQuery.findByPidAndPlatform(pid, platform);
    const channels = await this.chMapper.mapAll(entities);
    if (channels.length === 0) return undefined;
    if (channels.length > 1) throw new ConflictError(`Multiple channels with pid: ${pid}`);
    return this.solver.solveChannel(channels[0], withTags);
  }

  async findByUsername(username: string, withTags: boolean = false) {
    const entities = await this.chQuery.findByUsername(username);
    const channels = await this.chMapper.mapAll(entities);
    return this.solver.solveChannels(channels, withTags);
  }

  async findFollowedChannels(platform: PlatformType) {
    const entities = await this.chQuery.findByFollowedFlag(true, platform);
    return this.chMapper.mapAll(entities);
  }
}
