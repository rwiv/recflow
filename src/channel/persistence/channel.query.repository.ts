import { db } from '../../infra/db/db.js';
import { channels, channelsToTags } from './schema.js';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { ChannelEnt, ChannelPriority } from './channel.types.js';
import { Tx } from '../../infra/db/types.js';
import { Injectable } from '@nestjs/common';
import { ChannelSortType } from './tag.types.js';
import { PgSelect } from 'drizzle-orm/pg-core';
import type { SQLWrapper } from 'drizzle-orm/sql/sql';
import { oneNullable } from '../../utils/list.js';
import { TagQueryRepository } from './tag.query.repository.js';

@Injectable()
export class ChannelQueryRepository {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  findAll(tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channels);
  }

  async findById(channelId: string, tx: Tx = db): Promise<ChannelEnt | undefined> {
    return oneNullable(await tx.select().from(channels).where(eq(channels.id, channelId)));
  }

  async findByUsername(username: string, tx: Tx = db): Promise<ChannelEnt[]> {
    return tx.select().from(channels).where(eq(channels.username, username));
  }

  async findByQuery(
    page: { page: number; size: number } | undefined = undefined,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const bqb = tx.select().from(channels).$dynamic();
    const basis = this.withBasis(bqb, page, sorted, priority);

    if (tagName) {
      const tag = await this.tagQuery.findByName(tagName, tx);
      if (!tag) return [];
      const withTags = await basis.qb
        .innerJoin(channelsToTags, eq(channelsToTags.channelId, channels.id))
        .where(and(...basis.c, eq(channelsToTags.tagId, tag.id)));
      return withTags.map((r) => r.channels);
    }

    return basis.qb.where(and(...basis.c));
  }

  // using OR condition
  async findByAnyTag(
    tagNames: string[],
    page: { page: number; size: number } | undefined = undefined,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const tagIds = await this.tagQuery.findIdsByNames(tagNames, tx);
    if (tagIds.length === 0) return [];

    const bqb = tx.selectDistinct({ channels }).from(channels).$dynamic();
    const basis = this.withBasis(bqb, page, sorted, priority);

    const byTags = await basis.qb
      .innerJoin(channelsToTags, eq(channelsToTags.channelId, channels.id))
      .where(and(...basis.c, inArray(channelsToTags.tagId, tagIds)));

    return byTags.map((r) => r.channels);
  }

  // using AND condition
  async findByAllTags(
    tagNames: string[],
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tx: Tx = db,
  ) {
    const tagIds = await this.tagQuery.findIdsByNames(tagNames, tx);
    if (tagIds.length === 0) return [];
    const requiredTagCnt = tagIds.length;

    let channelTagCounts: { channelId: string; tagCnt: string }[] = [];
    if (priority) {
      channelTagCounts = await tx
        .select({
          channelId: channelsToTags.channelId,
          tagCnt: sql<string>`COUNT(DISTINCT ${channelsToTags.tagId})`,
        })
        .from(channelsToTags)
        .innerJoin(channels, eq(channels.id, channelsToTags.channelId))
        .where(and(inArray(channelsToTags.tagId, tagIds), eq(channels.priority, priority)))
        .groupBy(channelsToTags.channelId);
    } else {
      channelTagCounts = await tx
        .select({
          channelId: channelsToTags.channelId,
          tagCnt: sql<string>`COUNT(DISTINCT ${channelsToTags.tagId})`,
        })
        .from(channelsToTags)
        .where(and(inArray(channelsToTags.tagId, tagIds)))
        .groupBy(channelsToTags.channelId);
    }

    const matchingChannelIds = channelTagCounts
      .filter((row) => row.tagCnt === `${requiredTagCnt}`)
      .map((row) => row.channelId);
    if (matchingChannelIds.length === 0) {
      return [];
    }

    const qb = this.withSorted(tx.select().from(channels).$dynamic(), sorted);
    return qb.where(inArray(channels.id, matchingChannelIds));
  }

  private withBasis<T extends PgSelect>(
    qb: T,
    page: { page: number; size: number } | undefined = undefined,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
  ) {
    if (page) {
      if (page.page < 1) throw new Error('Page must be greater than 0');
      const offset = (page.page - 1) * page.size;
      qb = qb.offset(offset).limit(page.size);
    }
    qb = this.withSorted(qb, sorted);

    const conds: SQLWrapper[] = [];
    if (priority) {
      conds.push(eq(channels.priority, priority));
    }
    return { qb, c: conds };
  }

  private withSorted<T extends PgSelect>(qb: T, sorted: ChannelSortType = undefined) {
    if (sorted === 'latest') {
      qb = qb.orderBy(desc(channels.updatedAt));
    } else if (sorted === 'followerCnt') {
      qb = qb.orderBy(desc(channels.followerCnt));
    }
    return qb;
  }
}
