import { oneNotNull, oneNullable } from '../../utils/list.js';
import { db } from '../../infra/db/db.js';
import { channels } from './schema.js';
import { eq } from 'drizzle-orm';
import { ChannelCreation } from '../business/types.js';
import { uuid } from '../../utils/uuid.js';

export class ChannelRepository {
  async create(req: ChannelCreation) {
    const toBeAdded = {
      ...req,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
    };
    const query = db.insert(channels).values(toBeAdded).returning();
    return oneNotNull(await query);
  }

  async findAll() {
    return db.select().from(channels);
  }

  async findById(channelId: string) {
    return oneNullable(await db.select().from(channels).where(eq(channels.id, channelId)));
  }
}
