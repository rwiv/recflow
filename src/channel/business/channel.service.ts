import { ChannelCreation, ChannelRecord, ChannelUpdate, TagRecord } from '../persistence/types.js';
import { ChannelRepository } from '../persistence/channel.repository.js';
import { TagRepository } from '../persistence/tag.repository.js';
import { db } from '../../infra/db/db.js';

export class ChannelService {
  constructor(
    private readonly chanRepo: ChannelRepository,
    private readonly tagRepo: TagRepository,
  ) {}

  async create(req: ChannelCreation, reqTagNames: string[]): Promise<ChannelRecord> {
    return db.transaction(async (txx) => {
      const channel = await this.chanRepo.create(req, txx);
      const tags: TagRecord[] = [];
      for (const tagName of reqTagNames) {
        tags.push(await this.tagRepo.attach(channel.id, tagName, txx));
      }
      return {
        ...channel,
        tags,
      };
    });
  }

  async update(req: ChannelUpdate, reqTagNames: string[]): Promise<ChannelRecord> {
    return db.transaction(async (txx) => {
      const channel = await this.chanRepo.update(req, txx);
      const tags = await this.tagRepo.applyTags(channel.id, reqTagNames, txx);
      return {
        ...channel,
        tags,
      };
    });
  }

  async delete(channelId: string): Promise<ChannelRecord> {
    return this.chanRepo.delete(channelId);
  }

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    const channels = await this.chanRepo.findAll();
    if (!withTags) return channels;
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagRepo.findTagsByChannelId(channel.id),
    }));
    return Promise.all(promises);
  }

  async findById(channelId: string, withTags: boolean = false): Promise<ChannelRecord | undefined> {
    const channel = await this.chanRepo.findById(channelId);
    if (!channel) return undefined;
    if (!withTags) return channel;
    return {
      ...channel,
      tags: await this.tagRepo.findTagsByChannelId(channelId),
    };
  }
}
