import { TagRecord } from './types.js';
import { TagRepository } from '../persistence/tag.repository.js';
import { ChannelRepository } from '../persistence/channel.repository.js';

export class TagService {
  constructor(
    private readonly tagRepo: TagRepository,
    private readonly chanRepo: ChannelRepository,
  ) {}

  async create(name: string, description: string | null = null) {
    return this.tagRepo.create(name, description);
  }

  async attach(channelId: string, tagName: string) {
    const channel = await this.chanRepo.findById(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
    return this.tagRepo.attach(channel.id, tagName);
  }

  async detach(channelId: string, tagId: string) {
    return this.tagRepo.detach(channelId, tagId);
  }

  async findByChannelId(channelId: string): Promise<TagRecord[]> {
    return this.tagRepo.findByChannelId(channelId);
  }
}
