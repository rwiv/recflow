import { ChannelCreation, ChannelRecord } from './types.js';
import { ChannelRepository } from '../persistence/channel.repository.js';
import { TagRepository } from '../persistence/tag.repository.js';

export class ChannelService {
  constructor(
    private readonly chanRepo: ChannelRepository,
    private readonly tagRepo: TagRepository,
  ) {}

  async create(req: ChannelCreation) {
    return (await this.chanRepo.create(req)) as ChannelRecord;
  }

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    const channels = await this.chanRepo.findAll();
    if (!withTags) return channels as ChannelRecord[];
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagRepo.findTagsByChannelId(channel.id),
    }));
    return (await Promise.all(promises)) as ChannelRecord[];
  }

  async findById(channelId: string, withTags: boolean = false): Promise<ChannelRecord | undefined> {
    const channel = await this.chanRepo.findById(channelId);
    if (!channel) return undefined;
    if (!withTags) return channel as ChannelRecord;
    return {
      ...channel,
      tags: await this.tagRepo.findTagsByChannelId(channelId),
    } as ChannelRecord;
  }
}
