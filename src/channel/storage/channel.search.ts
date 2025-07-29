import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { channelTagMapTable, channelTable } from '../../infra/db/schema.js';
import { and, desc, eq, exists, inArray, notExists, sql } from 'drizzle-orm';
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

export interface ChannelSearchRequest {
  page?: PageQuery;
  sortBy?: ChannelSortType;
  priorityName?: string;
  withTotal?: boolean;
}

export interface ChannelTagSearchRequest extends ChannelSearchRequest {
  includeTagNames: string[];
  excludeTagNames: string[];
}

@Injectable()
export class ChannelSearchRepository {
  constructor(
    private readonly tagQuery: TagQueryRepository,
    private readonly priRepo: PriorityRepository,
  ) {}

  async findByQuery(req: ChannelSearchRequest, tx: Tx = db): Promise<ChannelPageEntResult> {
    const { page, sortBy, priorityName, withTotal } = req;
    let qb = tx.select().from(channelTable).$dynamic();
    const conds: SQLWrapper[] = [];
    if (priorityName) await this.withPriority(conds, priorityName, tx);
    qb = qb.where(and(...conds));

    let total = undefined;
    if (withTotal) {
      total = total = await tx.$count(qb);
    }
    if (sortBy) qb = this.withSorted(qb, sortBy);
    if (page) qb = this.withPage(qb, page);
    const result: ChannelPageEntResult = { channels: await qb };
    if (total !== undefined) {
      result.total = total;
    }
    return result;
  }

  // async findByTagsLegacy(req: ChannelTagSearchRequest, tx: Tx = db): Promise<ChannelPageEntResult> {
  //   const { includeTagNames, excludeTagNames, page, sortBy, priorityName, withTotal } = req;
  //   const includeIds = await this.tagQuery.findIdsByNames(includeTagNames, tx);
  //   let excludeIds: string[] = [];
  //   if (excludeTagNames.length > 0) {
  //     this.checkDuplicatedTags(includeTagNames, excludeTagNames);
  //     excludeIds = await this.tagQuery.findIdsByNames(excludeTagNames, tx);
  //   }
  //   const merged = [...includeIds, ...excludeIds];
  //   const conds: SQLWrapper[] = [inArray(channelTagMapTable.tagId, merged)];
  //
  //   let qb = db
  //     .select({ channels: channelTable })
  //     .from(channelTable)
  //     .leftJoin(channelTagMapTable, eq(channelTable.id, channelTagMapTable.channelId))
  //     .$dynamic();
  //
  //   if (priorityName) await this.withPriority(conds, priorityName, tx);
  //   let having: any = eq(getSubCountSQL(includeIds, channelTagMapTable.tagId), includeIds.length);
  //   if (excludeIds.length > 0) {
  //     having = and(
  //       eq(getSubCountSQL(includeIds, channelTagMapTable.tagId), includeIds.length),
  //       eq(getSubCountSQL(excludeIds, channelTagMapTable.tagId), 0),
  //     );
  //   }
  //   qb = qb
  //     .where(and(...conds))
  //     .groupBy(channelTable.id)
  //     .having(having);
  //
  //   let total = undefined;
  //   if (withTotal) {
  //     total = total = await tx.$count(qb);
  //   }
  //   if (sortBy) qb = this.withSorted(qb, sortBy);
  //   if (page) qb = this.withPage(qb, page);
  //   const result: ChannelPageEntResult = { channels: (await qb).map((row) => row.channels) };
  //   if (total !== undefined) {
  //     result.total = total;
  //   }
  //   return result;
  // }

  async findByTags(req: ChannelTagSearchRequest, tx: Tx = db): Promise<ChannelPageEntResult> {
    const { includeTagNames, excludeTagNames, page, sortBy, priorityName, withTotal } = req;
    const includeTagIds = await this.tagQuery.findIdsByNames(includeTagNames, tx);
    let excludeTagIds: string[] = [];
    if (excludeTagNames.length > 0) {
      this.checkDuplicatedTags(includeTagNames, excludeTagNames);
      excludeTagIds = await this.tagQuery.findIdsByNames(excludeTagNames, tx);
    }

    let qb = tx.select().from(channelTable).$dynamic();
    const conds: SQLWrapper[] = [];
    for (const tagId of includeTagIds) {
      const cond = and(eq(channelTagMapTable.channelId, channelTable.id), eq(channelTagMapTable.tagId, tagId));
      const subQuery = db.select().from(channelTagMapTable).where(cond);
      conds.push(exists(subQuery));
    }
    if (excludeTagIds.length > 0) {
      const cond = and(
        eq(channelTagMapTable.channelId, channelTable.id),
        inArray(channelTagMapTable.tagId, excludeTagIds),
      );
      const subQuery = db.select().from(channelTagMapTable).where(cond);
      conds.push(notExists(subQuery));
    }

    if (priorityName) await this.withPriority(conds, priorityName, tx);
    qb = qb.where(and(...conds));

    let total = undefined;
    if (withTotal) {
      total = total = await tx.$count(qb);
    }
    if (sortBy) qb = this.withSorted(qb, sortBy);
    if (page) qb = this.withPage(qb, page);
    const result: ChannelPageEntResult = { channels: await qb };
    if (total !== undefined) {
      result.total = total;
    }
    return result;
  }

  private checkDuplicatedTags(includeTagNames: string[], excludeTagNames: string[]) {
    const set = new Set(includeTagNames);
    for (const name of excludeTagNames) {
      if (set.has(name)) {
        throw new ValidationError('Duplicated tag names');
      }
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

function getSubCountSQL(tags: string[], key: any) {
  return sql<number>`COUNT(DISTINCT CASE WHEN ${key} IN ${tags} THEN ${key} END)`.mapWith(Number);
}
