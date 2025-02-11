import { Injectable } from '@nestjs/common';
import { ChannelSortArg, channelPageResult, ChannelPageResult } from './channel.business.schema.js';
import { ChannelPageEntResult } from '../persistence/channel.persistence.schema.js';
import { ChannelSearchRepository } from '../persistence/channel.search.js';
import { ChannelMapper } from './channel.mapper.js';
import { PageQuery } from '../../../common/data/common.schema.js';

@Injectable()
export class ChannelSearcher {
  constructor(
    private readonly chSearch: ChannelSearchRepository,
    private readonly chMapper: ChannelMapper,
  ) {}

  async findByQuery(
    page: PageQuery,
    sorted: ChannelSortArg = undefined,
    priority: string | undefined = undefined,
    tagName: string | undefined = undefined,
    withTags: boolean = false,
  ) {
    const entRet = await this.chSearch.findByQuery(page, sorted, priority, tagName);
    return this.toPageResult(entRet, withTags);
  }

  async findByAnyTag(
    includeTagNames: string[],
    excludeTagNames: string[],
    page: PageQuery | undefined = undefined,
    sorted: ChannelSortArg = undefined,
    priority: string | undefined = undefined,
    withTags: boolean = false,
  ) {
    const entRet = await this.chSearch.findByAnyTag(
      includeTagNames,
      excludeTagNames,
      page,
      sorted,
      priority,
    );
    return this.toPageResult(entRet, withTags);
  }

  async findByAllTags(
    includeTagNames: string[],
    excludeTagNames: string[] | undefined = undefined,
    page: PageQuery | undefined = undefined,
    sorted: ChannelSortArg = undefined,
    priority: string | undefined = undefined,
    withTags: boolean = false,
  ) {
    const entRet = await this.chSearch.findByAllTags(
      includeTagNames,
      excludeTagNames,
      page,
      sorted,
      priority,
    );
    return this.toPageResult(entRet, withTags);
  }

  private async toPageResult(entRet: ChannelPageEntResult, withTags: boolean) {
    const { total, channels: entities } = entRet;
    const chsNotTags = await this.chMapper.mapAll(entities);
    const channels = await this.chMapper.loadRelations(chsNotTags, withTags);
    const result: ChannelPageResult = { total, channels };
    return channelPageResult.parse(result);
  }
}
