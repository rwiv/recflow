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
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { ChannelSearcher } from '../service/channel.searcher.js';
import { PageQuery, pageQuery } from '../../common/data/common.schema.js';
import { PriorityService } from '../service/priority.service.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly chSearcher: ChannelSearcher,
    private readonly priService: PriorityService,
  ) {}

  @Get('/')
  async channels(
    @Query('st') st?: string,
    @Query('pri') priority?: string,
    @Query('tn') tagName?: string,
    @Query('pid') pid?: string,
    @Query('uname') username?: string,
    @Query('p', new ParseIntPipe({ optional: true })) page?: number,
    @Query('s', new ParseIntPipe({ optional: true })) size?: number,
    @Query('wt', new ParseBoolPipe({ optional: true })) withTags?: boolean,
  ) {
    if (pid) {
      const channels = await this.chFinder.findByPid(pid, withTags);
      return channelPageResult.parse({ channels, total: 1 });
    }
    if (username) {
      const channels = await this.chFinder.findByUsernameLike(username, withTags);
      return channelPageResult.parse({ channels, total: 1 });
    }

    if (!page || !size) {
      throw new ValidationError('page and size must be provided');
    }
    let sortBy: ChannelSortType = 'updatedAt';
    if (st) {
      sortBy = channelSortTypeEnum.parse(st);
    }
    const pq: PageQuery = { page, size };
    if (tagName) {
      return this.chSearcher.findByAnyTag([tagName], undefined, pq, sortBy, priority, withTags);
    } else {
      return this.chSearcher.findByQuery(pageQuery.parse(pq), sortBy, priority, withTags);
    }
  }

  @Post('/')
  createChannel(@Body() req: ChannelAppendWithFetch) {
    return this.chWriter.createWithFetch(channelAppendWithFetch.parse(req));
  }

  @Put('/:channelId')
  update(@Param('channelId') channelId: string, @Body() req: ChannelUpdate) {
    const update = channelUpdate.parse(req);
    return this.chWriter.update(channelId, update, false);
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
