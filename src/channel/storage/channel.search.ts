import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { channelTagMapTable, channelTable } from '../../infra/db/schema.js';
import { and, desc, eq, exists, inArray, notExists } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import type { SQLWrapper } from 'drizzle-orm/sql/sql';
import { TagQueryRepository } from './tag.query.js';
import { Injectable } from '@nestjs/common';
import { PriorityRepository } from './priority.repository.js';
import { ChannelPageEntResult } from '../spec/channel.entity.schema.js';
import { channelSortTypeEnum, ChannelSortType } from '../spec/channel.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { PageQuery } from '../../common/data/common.schema.js';

@Injectable()
export class ChannelSearchRepository {
  constructor(
    private readonly tagQuery: TagQueryRepository,
    private readonly priRepo: PriorityRepository,
  ) {}

  async findByQuery(
    page?: PageQuery,
    sortBy?: ChannelSortType,
    priorityName?: string,
    tx: Tx = db,
  ): Promise<ChannelPageEntResult> {
    let qb = tx.select().from(channelTable).$dynamic();
    const conds: SQLWrapper[] = [];
    if (sortBy) qb = this.withSorted(qb, sortBy);
    if (priorityName) await this.withPriority(conds, priorityName, tx);
    qb = qb.where(and(...conds));

    const total = await tx.$count(qb);
    if (page) qb = this.withPage(qb, page);
    return { total, channels: await qb };
  }

  // using OR condition
  async findByAnyTag(
    includeTagNames: string[],
    excludeTagNames?: string[],
    page?: PageQuery,
    sortBy?: ChannelSortType,
    priorityName?: string,
    tx: Tx = db,
  ): Promise<ChannelPageEntResult> {
    const tagIds = await this.tagQuery.findIdsByNames(includeTagNames, tx);
    if (tagIds.length === 0) return { total: 0, channels: [] };
    let excludeIds: string[] = [];
    if (excludeTagNames && excludeTagNames.length > 0) {
      this.checkDuplicatedTags(includeTagNames, excludeTagNames);
      excludeIds = await this.tagQuery.findIdsByNames(excludeTagNames, tx);
    }

    let qb = tx
      .selectDistinct({ channels: channelTable })
      .from(channelTable)
      .innerJoin(channelTagMapTable, eq(channelTagMapTable.channelId, channelTable.id))
      .$dynamic();

    const conds: SQLWrapper[] = [];
    for (const tagId of excludeIds) {
      const cond = and(eq(channelTagMapTable.channelId, channelTable.id), eq(channelTagMapTable.tagId, tagId));
      const subQuery = db.select().from(channelTagMapTable).where(cond);
      conds.push(notExists(subQuery));
    }

    if (sortBy) qb = this.withSorted(qb, sortBy);
    if (priorityName) await this.withPriority(conds, priorityName, tx);
    qb = qb.where(and(...conds, inArray(channelTagMapTable.tagId, tagIds)));

    const total = await tx.$count(qb);
    if (page) qb = this.withPage(qb, page);
    return { total, channels: (await qb).map((r) => r.channels) };
  }

  async findByAllTags(
    includeTagNames: string[],
    excludeTagNames?: string[],
    page?: PageQuery,
    sortBy?: ChannelSortType,
    priorityName?: string,
    tx: Tx = db,
  ): Promise<ChannelPageEntResult> {
    const includeIds = await this.tagQuery.findIdsByNames(includeTagNames, tx);
    if (includeIds.length === 0) return { total: 0, channels: [] };
    let excludeIds: string[] = [];
    if (excludeTagNames && excludeTagNames.length > 0) {
      this.checkDuplicatedTags(includeTagNames, excludeTagNames);
      excludeIds = await this.tagQuery.findIdsByNames(excludeTagNames, tx);
    }

    let qb = tx.select().from(channelTable).$dynamic();
    const conds: SQLWrapper[] = [];
    for (const tagId of includeIds) {
      const cond = and(eq(channelTagMapTable.channelId, channelTable.id), eq(channelTagMapTable.tagId, tagId));
      const subQuery = db.select().from(channelTagMapTable).where(cond);
      conds.push(exists(subQuery));
    }
    for (const tagId of excludeIds) {
      const cond = and(eq(channelTagMapTable.channelId, channelTable.id), eq(channelTagMapTable.tagId, tagId));
      const subQuery = db.select().from(channelTagMapTable).where(cond);
      conds.push(notExists(subQuery));
    }

    if (sortBy) qb = this.withSorted(qb, sortBy);
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
    if (!priority) throw NotFoundError.from('Priority', 'name', priorityName);
    conditions.push(eq(channelTable.priorityId, priority.id));
  }

  private withPage<T extends PgSelect>(qb: T, page: PageQuery) {
    if (page.page < 1) throw new ValidationError('Page must be greater than 0');
    const offset = (page.page - 1) * page.size;
    return qb.offset(offset).limit(page.size);
  }

  private withSorted<T extends PgSelect>(qb: T, sortBy: ChannelSortType) {
    const sortType = channelSortTypeEnum.parse(sortBy);
    if (sortType === 'createdAt') {
      qb = qb.orderBy(desc(channelTable.createdAt));
    } else if (sortType == 'updatedAt') {
      qb = qb.orderBy(desc(channelTable.updatedAt));
    } else if (sortType === 'followerCnt') {
      qb = qb.orderBy(desc(channelTable.followerCnt));
    }
    return qb;
  }
}
