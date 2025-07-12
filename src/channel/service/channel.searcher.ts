import { Injectable } from '@nestjs/common';
import { channelPageResult, ChannelPageResult, ChannelSortType } from '../spec/channel.dto.schema.js';
import { ChannelPageEntResult } from '../spec/channel.entity.schema.js';
import { ChannelSearchRepository } from '../storage/channel.search.js';
import { ChannelMapper } from './channel.mapper.js';
import { PageQuery } from '../../common/data/common.schema.js';
import { ChannelMapOptions } from '../spec/channel.types.js';

@Injectable()
export class ChannelSearcher {
  constructor(
    private readonly chSearch: ChannelSearchRepository,
    private readonly chMapper: ChannelMapper,
  ) {}

  async findByQuery(page: PageQuery, sortBy?: ChannelSortType, priorityName?: string, opts: ChannelMapOptions = {}) {
    const entRet = await this.chSearch.findByQuery(page, sortBy, priorityName, true);
    return this.toPageResult(entRet, opts);
  }

  async findByAnyTag(
    includeTagNames: string[],
    excludeTagNames?: string[],
    page?: PageQuery,
    sortBy?: ChannelSortType,
    priority?: string,
    opts: ChannelMapOptions = {},
  ) {
    const entRet = await this.chSearch.findByAnyTag(includeTagNames, excludeTagNames, page, sortBy, priority, true);
    return this.toPageResult(entRet, opts);
  }

  async findByAllTags(
    includeTagNames: string[],
    excludeTagNames?: string[],
    page?: PageQuery,
    sortBy?: ChannelSortType,
    priority?: string,
    opts: ChannelMapOptions = {},
  ) {
    const entRet = await this.chSearch.findByAllTags2(includeTagNames, excludeTagNames, page, sortBy, priority, true);
    return this.toPageResult(entRet, opts);
  }

  private async toPageResult(entRet: ChannelPageEntResult, opts: ChannelMapOptions) {
    const { total, channels: entities } = entRet;
    const chsNotTags = await this.chMapper.mapAll(entities);
    const channels = await this.chMapper.loadRelations(chsNotTags, opts);
    const result: ChannelPageResult = { total, channels };
    return channelPageResult.parse(result);
  }
}
