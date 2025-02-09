import { Tx } from '../../../infra/db/types.js';
import { db } from '../../../infra/db/db.js';
import { channelsToTags, channels } from '../../../infra/db/schema.js';
import { and, desc, eq, exists, inArray, notExists } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import type { SQLWrapper } from 'drizzle-orm/sql/sql';
import { TagQueryRepository } from '../../tag/persistence/tag.query.js';
import { Injectable } from '@nestjs/common';
import { ChannelPriority } from '../../priority/priority.types.js';
import { ChannelPriorityRepository } from '../../priority/persistence/priority.repository.js';
import { PageEntResult } from './channel.persistence.schema.js';
import {
  chSortArg,
  ChannelSortArg,
  PageQueryOptional,
  PageQuery,
} from '../business/channel.business.schema.js';
import { ValidationError } from '../../../utils/errors/errors/ValidationError.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { EnumCheckError } from '../../../utils/errors/errors/EnumCheckError.js';

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

    if (sorted) qb = this.withSorted(qb, sorted);
    if (priorityName) await this.withPriority(conds, priorityName, tx);
    qb = qb.where(and(...conds));

    const total = await tx.$count(qb);
    if (page) qb = this.withPage(qb, page);
    return { total, channels: await qb };
  }

  // using OR condition
  async findByAnyTag(
    includeTagNames: string[],
    excludeTagNames: string[] | undefined,
    page: PageQueryOptional = undefined,
    sorted: ChannelSortArg = undefined,
    priorityName: ChannelPriority | undefined = undefined,
    tx: Tx = db,
  ): Promise<PageEntResult> {
    const tagIds = await this.tagQuery.findIdsByNames(includeTagNames, tx);
    if (tagIds.length === 0) return { total: 0, channels: [] };
    let excludeIds: string[] = [];
    if (excludeTagNames && excludeTagNames.length > 0) {
      this.checkDuplicatedTags(includeTagNames, excludeTagNames);
      excludeIds = await this.tagQuery.findIdsByNames(excludeTagNames, tx);
    }

    let qb = tx
      .selectDistinct({ channels: channels })
      .from(channels)
      .innerJoin(channelsToTags, eq(channelsToTags.channelId, channels.id))
      .$dynamic();

    const conds: SQLWrapper[] = [];
    for (const tagId of excludeIds) {
      const subQuery = db
        .select()
        .from(channelsToTags)
        .where(and(eq(channelsToTags.channelId, channels.id), eq(channelsToTags.tagId, tagId)));
      conds.push(notExists(subQuery));
    }

    if (sorted) qb = this.withSorted(qb, sorted);
    if (priorityName) await this.withPriority(conds, priorityName, tx);
    qb = qb.where(and(...conds, inArray(channelsToTags.tagId, tagIds)));

    const total = await tx.$count(qb);
    if (page) qb = this.withPage(qb, page);
    return { total, channels: (await qb).map((r) => r.channels) };
  }

  async findByAllTags(
    includeTagNames: string[],
    excludeTagNames: string[] | undefined,
    page: PageQueryOptional = undefined,
    sorted: ChannelSortArg = undefined,
    priorityName: string | undefined = undefined,
    tx: Tx = db,
  ): Promise<PageEntResult> {
    const includeIds = await this.tagQuery.findIdsByNames(includeTagNames, tx);
    if (includeIds.length === 0) return { total: 0, channels: [] };
    let excludeIds: string[] = [];
    if (excludeTagNames && excludeTagNames.length > 0) {
      this.checkDuplicatedTags(includeTagNames, excludeTagNames);
      excludeIds = await this.tagQuery.findIdsByNames(excludeTagNames, tx);
    }

    let qb = tx.select().from(channels).$dynamic();
    const conds: SQLWrapper[] = [];
    for (const tagId of includeIds) {
      const subQuery = db
        .select()
        .from(channelsToTags)
        .where(and(eq(channelsToTags.channelId, channels.id), eq(channelsToTags.tagId, tagId)));
      conds.push(exists(subQuery));
    }
    for (const tagId of excludeIds) {
      const subQuery = db
        .select()
        .from(channelsToTags)
        .where(and(eq(channelsToTags.channelId, channels.id), eq(channelsToTags.tagId, tagId)));
      conds.push(notExists(subQuery));
    }

    if (sorted) qb = this.withSorted(qb, sorted);
    if (priorityName) await this.withPriority(conds, priorityName, tx);
    qb = qb.where(and(...conds));

    const total = await tx.$count(qb);
    if (page) qb = this.withPage(qb, page);
    return { total, channels: await qb };
  }

  private checkDuplicatedTags(includeTagNames: string[], excludeTagNames: string[]) {
    const set = new Set(includeTagNames);
    for (const name of excludeTagNames) {
      if (set.has(name)) throw new ValidationError('Duplicated tag names');
    }
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
