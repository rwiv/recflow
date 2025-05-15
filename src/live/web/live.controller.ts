import { Body, Controller, Delete, Get, Post, UseFilters } from '@nestjs/common';
import { LiveRegistrar } from '../registry/live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { exitCmd } from '../spec/event.schema.js';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveFieldsReq } from '../data/live.mapper.js';
import {
  liveAppendRequest,
  LiveAppendRequest,
  liveDeleteRequest,
  LiveDeleteRequest,
} from './live.web.schema.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { LiveFinishRequest, liveFinishRequest, LiveFinalizer } from '../registry/live.finalizer.js';
import { log } from 'jslog';
import { stacktrace } from '../../utils/errors/utils.js';
import {
  LiveRebalancer,
  nodeAdjustRequest,
  NodeAdjustRequest,
  nodeGroupAdjustRequest,
  NodeGroupAdjustRequest,
} from '../registry/live.rebalancer.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/lives')
export class LiveController {
  constructor(
    private readonly liveService: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
    private readonly liveFinder: LiveFinder,
    private readonly finalizer: LiveFinalizer,
    private readonly rebalancer: LiveRebalancer,
  ) {}

  @Get('/')
  allActives(): Promise<LiveDto[]> {
    const opt: LiveFieldsReq = {
      nodes: true,
      nodeGroup: true,
    };
    return this.liveFinder.findAllActives(opt);
  }

  @Get('/all')
  all(): Promise<LiveDto[]> {
    const opt: LiveFieldsReq = {
      nodes: true,
      nodeGroup: true,
    };
    return this.liveFinder.findAll(opt);
  }

  @Post('/')
  async add(@Body() req: LiveAppendRequest) {
    const append = liveAppendRequest.parse(req);
    const channel = await this.fetcher.fetchChannelNotNull(append.platformName, append.pid, true);
    if (!channel.liveInfo) {
      throw new NotFoundError('Channel is not live');
    }
    return this.liveService.register({ channelInfo: channelLiveInfo.parse(channel) });
  }

  @Delete('/')
  async delete(@Body() req: LiveDeleteRequest) {
    const { recordId, cmd, isPurge } = liveDeleteRequest.parse(req);
    return this.liveService.finishLive(recordId, { exitCmd: exitCmd.parse(cmd), isPurge });
  }

  @Post('/tasks/finish')
  finish(@Body() req: LiveFinishRequest) {
    this.finalizer.finishLive(liveFinishRequest.parse(req)).catch((err) => {
      log.error('Error while finishing live', { stacktrace: stacktrace(err) });
    });
    return 'ok';
  }

  @Post('/tasks/adjust/node-group')
  adjustNodeGroup(@Body() req: NodeGroupAdjustRequest) {
    this.rebalancer.adjustByNodeGroup(nodeGroupAdjustRequest.parse(req)).catch((err) => {
      log.error('Error while adjusting nodeGroup', { stacktrace: stacktrace(err) });
    });
    return 'ok';
  }

  @Post('/tasks/adjust/node')
  adjustNode(@Body() req: NodeAdjustRequest) {
    this.rebalancer.adjustByNode(nodeAdjustRequest.parse(req), []).catch((err) => {
      log.error('Error while adjusting node', { stacktrace: stacktrace(err) });
    });
    return 'ok';
  }
}
