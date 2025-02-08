import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { channelsToTags, channels } from '../../infra/db/schema.js';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import type { SQLWrapper } from 'drizzle-orm/sql/sql';
import { TagQueryRepository } from './tag.query.js';
import { Injectable } from '@nestjs/common';
import { ChannelPriority } from '../priority/types.js';
import { ChannelPriorityRepository } from '../priority/priority.repository.js';
import { ChannelEnt } from './channel.schema.js';
import { channelSortArg, ChannelSortType, PageQueryOptional } from '../business/channel.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

@Injectable()
export class ChannelSearchRepository {
  constructor(
    private readonly tagQuery: TagQueryRepository,
    private readonly priRepo: ChannelPriorityRepository,
  ) {}

  async findByQuery(
    page: PageQueryOptional = undefined,
    sorted: ChannelSortType = undefined,
    priorityName: string | undefined = undefined,
    tagName: string | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const bqb = tx.select().from(channels).$dynamic();
    let priorityId = undefined;
    if (priorityName) {
      priorityId = (await this.priRepo.findByName(priorityName, tx))?.id;
    }
    const basis = this.withBasis(bqb, page, sorted, priorityId);

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
    page: PageQueryOptional = undefined,
    sorted: ChannelSortType = undefined,
    priorityName: ChannelPriority | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const tagIds = await this.tagQuery.findIdsByNames(tagNames, tx);
    if (tagIds.length === 0) return [];

    const bqb = tx.selectDistinct({ channels: channels }).from(channels).$dynamic();
    let priorityId = undefined;
    if (priorityName) {
      priorityId = (await this.priRepo.findByName(priorityName, tx))?.id;
    }
    const basis = this.withBasis(bqb, page, sorted, priorityId);

    const byTags = await basis.qb
      .innerJoin(channelsToTags, eq(channelsToTags.channelId, channels.id))
      .where(and(...basis.c, inArray(channelsToTags.tagId, tagIds)));

    return byTags.map((r) => r.channels);
  }

  private withBasis<T extends PgSelect>(
    qb: T,
    page: PageQueryOptional = undefined,
    sorted: ChannelSortType = undefined,
    priorityId: string | undefined = undefined,
  ) {
    if (page) {
      if (page.page < 1) throw new ValidationError('Page must be greater than 0');
      const offset = (page.page - 1) * page.size;
      qb = qb.offset(offset).limit(page.size);
    }
    qb = this.withSorted(qb, sorted);

    const conds: SQLWrapper[] = [];
    if (priorityId) {
      conds.push(eq(channels.priorityId, priorityId));
    }
    return { qb, c: conds };
  }

  private withSorted<T extends PgSelect>(qb: T, sorted: ChannelSortType = undefined) {
    const sortType = channelSortArg.parse(sorted);
    if (sortType === 'latest') {
      qb = qb.orderBy(desc(channels.updatedAt));
    } else if (sortType === 'followerCnt') {
      qb = qb.orderBy(desc(channels.followerCnt));
    }
    return qb;
  }
}
