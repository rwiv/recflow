import { ChannelSortType } from './tag.types.js';
import { ChannelEntV2 } from './channel.types.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { channelsToTags, channelsV2 } from '../../infra/db/schema.js';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import type { SQLWrapper } from 'drizzle-orm/sql/sql';
import { TagQueryRepository } from './tag.query.js';
import { Injectable } from '@nestjs/common';
import { ChannelPriority } from '../priority/types.js';
import { ChannelPriorityRepository } from './priority.repository.js';

@Injectable()
export class ChannelSearchRepository {
  constructor(
    private readonly tagQuery: TagQueryRepository,
    private readonly priRepo: ChannelPriorityRepository,
  ) {}

  async findByQuery(
    page: { page: number; size: number } | undefined = undefined,
    sorted: ChannelSortType = undefined,
    priorityName: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelEntV2[]> {
    const bqb = tx.select().from(channelsV2).$dynamic();
    let priorityId = undefined;
    if (priorityName) {
      priorityId = (await this.priRepo.findByName(priorityName, tx))?.id;
    }
    const basis = this.withBasis(bqb, page, sorted, priorityId);

    if (tagName) {
      const tag = await this.tagQuery.findByName(tagName, tx);
      if (!tag) return [];
      const withTags = await basis.qb
        .innerJoin(channelsToTags, eq(channelsToTags.channelId, channelsV2.id))
        .where(and(...basis.c, eq(channelsToTags.tagId, tag.id)));
      return withTags.map((r) => r.channels_v2);
    }

    return basis.qb.where(and(...basis.c));
  }

  // using OR condition
  async findByAnyTag(
    tagNames: string[],
    page: { page: number; size: number } | undefined = undefined,
    sorted: ChannelSortType = undefined,
    priorityName: ChannelPriority | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelEntV2[]> {
    const tagIds = await this.tagQuery.findIdsByNames(tagNames, tx);
    if (tagIds.length === 0) return [];

    const bqb = tx.selectDistinct({ channels: channelsV2 }).from(channelsV2).$dynamic();
    let priorityId = undefined;
    if (priorityName) {
      priorityId = (await this.priRepo.findByName(priorityName, tx))?.id;
    }
    const basis = this.withBasis(bqb, page, sorted, priorityId);

    const byTags = await basis.qb
      .innerJoin(channelsToTags, eq(channelsToTags.channelId, channelsV2.id))
      .where(and(...basis.c, inArray(channelsToTags.tagId, tagIds)));

    return byTags.map((r) => r.channels);
  }

  private withBasis<T extends PgSelect>(
    qb: T,
    page: { page: number; size: number } | undefined = undefined,
    sorted: ChannelSortType = undefined,
    priorityId: string | undefined = undefined,
  ) {
    if (page) {
      if (page.page < 1) throw new Error('Page must be greater than 0');
      const offset = (page.page - 1) * page.size;
      qb = qb.offset(offset).limit(page.size);
    }
    qb = this.withSorted(qb, sorted);

    const conds: SQLWrapper[] = [];
    if (priorityId) {
      conds.push(eq(channelsV2.priorityId, priorityId));
    }
    return { qb, c: conds };
  }

  private withSorted<T extends PgSelect>(qb: T, sorted: ChannelSortType = undefined) {
    if (sorted === 'latest') {
      qb = qb.orderBy(desc(channelsV2.updatedAt));
    } else if (sorted === 'followerCnt') {
      qb = qb.orderBy(desc(channelsV2.followerCnt));
    }
    return qb;
  }
}
