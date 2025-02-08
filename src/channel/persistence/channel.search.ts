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
import { ChannelEnt, PageEntResult } from './channel.schema.js';
import {
  chSortArg,
  ChannelSortArg,
  PageQueryOptional,
  PageQuery,
} from '../business/channel.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';

@Injectable()
export class ChannelSearchRepository {
  constructor(
    private readonly tagQuery: TagQueryRepository,
    private readonly priRepo: ChannelPriorityRepository,
  ) {}

  async findByQuery(
    page: PageQueryOptional = undefined,
    sorted: ChannelSortArg = undefined,
    priorityName: string | undefined = undefined,
    tagName: string | undefined = undefined,
    tx: Tx = db,
  ): Promise<PageEntResult> {
    let qb = tx.select().from(channels).$dynamic();
    const conds: SQLWrapper[] = [];
    if (sorted) qb = this.withSorted(qb, sorted);
    if (priorityName) await this.withPriority(conds, priorityName, tx);

    if (tagName) {
      const tag = await this.tagQuery.findByName(tagName, tx);
      if (!tag) return { total: 0, channels: [] };

      let nqb = qb
        .innerJoin(channelsToTags, eq(channelsToTags.channelId, channels.id))
        .where(and(...conds, eq(channelsToTags.tagId, tag.id)));

      const total = await tx.$count(qb);
      if (page) nqb = this.withPage(nqb, page);
      return { total, channels: (await nqb).map((r) => r.channels) };
    }

    qb = qb.where(and(...conds));
    const total = await tx.$count(qb);
    if (page) qb = this.withPage(qb, page);
    return { total, channels: await qb };
  }

  // using OR condition
  async findByAnyTag(
    tagNames: string[],
    page: PageQueryOptional = undefined,
    sorted: ChannelSortArg = undefined,
    priorityName: ChannelPriority | undefined = undefined,
    tx: Tx = db,
  ): Promise<ChannelEnt[]> {
    const tagIds = await this.tagQuery.findIdsByNames(tagNames, tx);
    if (tagIds.length === 0) return [];

    let qb = tx
      .selectDistinct({ channels: channels })
      .from(channels)
      .innerJoin(channelsToTags, eq(channelsToTags.channelId, channels.id))
      .$dynamic();

    const conds: SQLWrapper[] = [];
    if (page) qb = this.withPage(qb, page);
    if (sorted) qb = this.withSorted(qb, sorted);
    if (priorityName) await this.withPriority(conds, priorityName, tx);
    qb = qb.where(and(...conds, inArray(channelsToTags.tagId, tagIds)));

    return (await qb).map((r) => r.channels);
  }

  private async withPriority(conditions: SQLWrapper[], priorityName: string, tx: Tx = db) {
    const priority = await this.priRepo.findByName(priorityName, tx);
    if (!priority) throw new NotFoundError('Priority not found');
    conditions.push(eq(channels.priorityId, priority.id));
  }

  private withPage<T extends PgSelect>(qb: T, page: PageQuery) {
    if (page.page < 1) throw new ValidationError('Page must be greater than 0');
    const offset = (page.page - 1) * page.size;
    return qb.offset(offset).limit(page.size);
  }

  private withSorted<T extends PgSelect>(qb: T, sorted: ChannelSortArg) {
    const sortType = chSortArg.parse(sorted);
    if (sortType === 'latest') {
      qb = qb.orderBy(desc(channels.updatedAt));
    } else if (sortType === 'followerCnt') {
      qb = qb.orderBy(desc(channels.followerCnt));
    } else {
      throw new EnumCheckError(`Invalid sort type: ${sortType}`);
    }
    return qb;
  }
}
