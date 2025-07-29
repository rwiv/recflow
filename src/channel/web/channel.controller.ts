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
import { ChannelWriter } from '../service/channel.writer.js';
import {
  ChannelAppendWithFetch,
  ChannelUpdate,
  channelUpdate,
  channelAppendWithFetch,
  channelPageResult,
  channelSortTypeEnum,
  ChannelSortType,
} from '../spec/channel.dto.schema.js';
import { ChannelFinder } from '../service/channel.finder.js';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { ChannelSearcher } from '../service/channel.searcher.js';
import { PageQuery, pageQuery } from '../../common/data/common.schema.js';
import { PriorityService } from '../service/priority.service.js';
import { ChannelMapOptions } from '../spec/channel.types.js';
import { ChannelMapper } from '../service/channel.mapper.js';
import { ChannelSearchRequest, ChannelTagSearchRequest } from '../storage/channel.search.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly chSearcher: ChannelSearcher,
    private readonly priService: PriorityService,
    private readonly chMapper: ChannelMapper,
  ) {}

  @Get('/')
  async channels(
    @Query('st') st?: string,
    @Query('pri') priority?: string,
    @Query('it') includeTagsStr?: string,
    @Query('et') excludeTagsStr?: string,
    @Query('pid') pid?: string,
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

    if (pid) {
      const dtos = await this.chFinder.findByPid(pid);
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

    const req: ChannelSearchRequest = { page, sortBy, priorityName: priority, withTotal: true };

    if (includeTagsStr || excludeTagsStr) {
      const tagReq: ChannelTagSearchRequest = {
        ...req,
        includeTagNames: includeTagsStr ? includeTagsStr.split(',') : [],
        excludeTagNames: excludeTagsStr ? excludeTagsStr.split(',') : [],
      };
      return this.chSearcher.findByAllTags(tagReq, opts);
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

  @Get('/priorities')
  priorities() {
    return this.priService.findAll();
  }
}
