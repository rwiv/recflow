import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';

import { ValidationError } from '@/utils/errors/errors/ValidationError.js';

import { PageQuery, pageQuery } from '@/common/data/common.schema.js';
import { HttpErrorFilter } from '@/common/error/error.filter.js';

import { platformNameEnum } from '@/platform/spec/storage/platform.enum.schema.js';

import { ChannelFinder } from '@/channel/service/channel.finder.js';
import { ChannelMapper } from '@/channel/service/channel.mapper.js';
import { ChannelSearcher } from '@/channel/service/channel.searcher.js';
import { ChannelWriter } from '@/channel/service/channel.writer.js';
import { GradeService } from '@/channel/service/grade.service.js';
import {
  ChannelAppendWithFetch,
  ChannelSortType,
  ChannelUpdate,
  channelAppendWithFetch,
  channelPageResult,
  channelSortTypeEnum,
  channelUpdate,
} from '@/channel/spec/channel.dto.schema.js';
import { ChannelMapOptions } from '@/channel/spec/channel.types.js';
import { ChannelSearchRequest, ChannelTagSearchRequest } from '@/channel/storage/channel.search.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly chSearcher: ChannelSearcher,
    private readonly grService: GradeService,
    private readonly chMapper: ChannelMapper,
  ) {}

  @Get('/')
  async channels(
    @Query('st') st?: string,
    @Query('gr') grade?: string,
    @Query('pf') platform?: string,
    @Query('it') includeTagsStr?: string,
    @Query('et') excludeTagsStr?: string,
    @Query('uid') sourceId?: string,
    @Query('uname') username?: string,
    @Query('p', new ParseIntPipe({ optional: true })) pageNum?: number,
    @Query('s', new ParseIntPipe({ optional: true })) size?: number,
    @Query('wt', new ParseBoolPipe({ optional: true })) withTags?: boolean,
    @Query('wtp', new ParseBoolPipe({ optional: true })) withTopics?: boolean,
  ) {
    const opts: ChannelMapOptions = {
      tags: withTags ?? false,
      topics: withTopics ?? false,
    };

    if (sourceId) {
      const dtos = await this.chFinder.findBySourceId(sourceId);
      const channels = await this.chMapper.loadRelations(dtos, opts);
      return channelPageResult.parse({ channels, total: 1 });
    }
    if (username) {
      const dtos = await this.chFinder.findByUsernameLike(username);
      const channels = await this.chMapper.loadRelations(dtos, opts);
      return channelPageResult.parse({ channels, total: 1 });
    }

    if (!pageNum || !size) {
      throw new ValidationError('page and size must be provided');
    }
    let sortBy: ChannelSortType = 'updatedAt';
    if (st) {
      sortBy = channelSortTypeEnum.parse(st);
    }
    const pageQ: PageQuery = { page: pageNum, size };
    const page = pageQuery.parse(pageQ);
    const platformName = platform ? platformNameEnum.parse(platform) : undefined;

    const req: ChannelSearchRequest = { page, sortBy, gradeName: grade, platformName, withTotal: true };

    if (includeTagsStr || excludeTagsStr) {
      const tagReq: ChannelTagSearchRequest = {
        ...req,
        includeTagNames: includeTagsStr ? includeTagsStr.split(',') : [],
        excludeTagNames: excludeTagsStr ? excludeTagsStr.split(',') : [],
      };
      return this.chSearcher.findByTags(tagReq, opts);
    }

    return this.chSearcher.findByQuery(req, opts);
  }

  @Post('/')
  createChannel(@Body() req: ChannelAppendWithFetch) {
    return this.chWriter.createWithFetch(channelAppendWithFetch.parse(req));
  }

  @Put('/:channelId')
  update(@Param('channelId') channelId: string, @Body() req: ChannelUpdate) {
    const update = channelUpdate.parse(req);
    return this.chWriter.update(channelId, update, {});
  }

  @Delete('/:channelId')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.chWriter.delete(channelId);
  }

  @Get('/grades')
  grades() {
    return this.grService.findAll();
  }
}
