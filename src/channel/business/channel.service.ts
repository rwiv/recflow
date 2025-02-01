import { db } from '../../infra/db/db.js';
import { channels } from '../persistence/schema.js';
import { ChannelCreation, ChannelRecord } from './types.js';
import { eq } from 'drizzle-orm';
import { oneNotNull, oneNullable } from '../../utils/list.js';
import { TagService } from './tag.service.js';
import { uuid } from '../../utils/uuid.js';

export class ChannelService {
  constructor(private readonly tagRepo: TagService) {}

  async createChannel(req: ChannelCreation) {
    const toBeAdded = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    const query = db.insert(channels).values(toBeAdded).returning();
    return oneNotNull(await query) as ChannelRecord;
  }

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    const channelList = await db.select().from(channels);
    if (!withTags) {
      return channelList as ChannelRecord[];
    }
    const promises = channelList.map(async (channel) => ({
      ...channel,
      tags: await this.tagRepo.findByChannelId(channel.id),
    }));
    return (await Promise.all(promises)) as ChannelRecord[];
  }

  async findById(channelId: string, withTags: boolean = false): Promise<ChannelRecord | undefined> {
    const channel = oneNullable(await db.select().from(channels).where(eq(channels.id, channelId)));
    if (!channel) {
      return undefined;
    }
    if (!withTags) {
      return channel as ChannelRecord;
    }
    return {
      ...channel,
      tags: await this.tagRepo.findByChannelId(channelId),
    } as ChannelRecord;
  }
}
