import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { channelTagMapTable, channelTagTable } from '../../infra/db/schema.js';
import { oneNullable } from '../../utils/list.js';
import { eq, inArray } from 'drizzle-orm';
import { TagEnt } from '../spec/tag.entity.schema.js';

@Injectable()
export class TagQueryRepository {
  async findAll(tx: Tx = db): Promise<TagEnt[]> {
    return tx.select().from(channelTagTable);
  }

  async findById(tagId: string, tx: Tx = db): Promise<TagEnt | null> {
    const ent = await tx.select().from(channelTagTable).where(eq(channelTagTable.id, tagId));
    return oneNullable(ent);
  }

  async findByName(tagName: string, tx: Tx = db): Promise<TagEnt | null> {
    const ent = await tx.select().from(channelTagTable).where(eq(channelTagTable.name, tagName));
    return oneNullable(ent);
  }

  async findTagsByChannelId(channelId: string, tx: Tx = db): Promise<TagEnt[]> {
    const rows = await tx
      .select()
      .from(channelTagMapTable)
      .innerJoin(channelTagTable, eq(channelTagMapTable.tagId, channelTagTable.id))
      .where(eq(channelTagMapTable.channelId, channelId));
    return rows.map((row) => row.channel_tag).filter((tag) => tag !== null);
  }

  async findIdsByNames(tagNames: string[], tx: Tx = db) {
    const rows = await tx
      .select({ id: channelTagTable.id })
      .from(channelTagTable)
      .where(inArray(channelTagTable.name, tagNames));
    return rows.map((row) => row.id);
  }
}
