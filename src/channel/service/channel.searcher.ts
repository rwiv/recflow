import { Injectable } from '@nestjs/common';

import { ChannelMapper } from '@/channel/service/channel.mapper.js';
import { ChannelPageResult, channelPageResult } from '@/channel/spec/channel.dto.schema.js';
import { ChannelPageEntResult } from '@/channel/spec/channel.entity.schema.js';
import { ChannelMapOptions } from '@/channel/spec/channel.types.js';
import {
  ChannelSearchRepository,
  ChannelSearchRequest,
  ChannelTagSearchRequest,
} from '@/channel/storage/channel.search.js';

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

  async findByTags(req: ChannelTagSearchRequest, opts: ChannelMapOptions = {}) {
    const entRet = await this.chSearch.findByTags(req);
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
