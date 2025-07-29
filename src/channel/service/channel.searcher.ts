import { Injectable } from '@nestjs/common';
import { channelPageResult, ChannelPageResult } from '../spec/channel.dto.schema.js';
import { ChannelPageEntResult } from '../spec/channel.entity.schema.js';
import { ChannelSearchRepository, ChannelSearchRequest, ChannelTagSearchRequest } from '../storage/channel.search.js';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelMapOptions } from '../spec/channel.types.js';

@Injectable()
export class ChannelSearcher {
  constructor(
    private readonly chSearch: ChannelSearchRepository,
    private readonly chMapper: ChannelMapper,
  ) {}

  async findByQuery(req: ChannelSearchRequest, opts: ChannelMapOptions = {}) {
    const entRet = await this.chSearch.findByQuery(req);
    return this.toPageResult(entRet, opts);
  }

  async findByAnyTag(req: ChannelTagSearchRequest, opts: ChannelMapOptions = {}) {
    const entRet = await this.chSearch.findByAnyTag(req);
    return this.toPageResult(entRet, opts);
  }

  async findByAllTags(req: ChannelTagSearchRequest, opts: ChannelMapOptions = {}) {
    const entRet = await this.chSearch.findByAllTags(req);
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
