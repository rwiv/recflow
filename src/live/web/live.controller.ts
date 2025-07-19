import { Body, Controller, Delete, Get, Param, Post, UseFilters } from '@nestjs/common';
import { LiveRegistrar } from '../registry/live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { exitCmd } from '../spec/event.schema.js';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinder } from '../data/live.finder.js';
import { liveAppendRequest, LiveAppendRequest, liveDeleteRequest, LiveDeleteRequest } from './live.web.schema.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { LiveFinishRequest, liveFinishRequest, LiveFinalizer } from '../registry/live.finalizer.js';
import { log } from 'jslog';
import { stacktrace } from '../../utils/errors/utils.js';
import { LiveRebalancer } from '../registry/live.rebalancer.js';

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
    return this.liveFinder.findAllActives({ nodes: true, nodeGroup: true });
  }

  @Get('/all')
  all(): Promise<LiveDto[]> {
    return this.liveFinder.findAll({ nodes: true, nodeGroup: true });
  }

  @Post('/')
  async add(@Body() req: LiveAppendRequest) {
    const append = liveAppendRequest.parse(req);
    const channel = await this.fetcher.fetchChannelNotNull(append.platformName, append.pid, true);
    if (!channel.liveInfo) {
      throw new NotFoundError('Channel is not live');
    }
    return this.liveService.register({
      channelInfo: channelLiveInfo.parse(channel),
      stream: req.stream ?? undefined,
    });
  }

  @Delete('/')
  async delete(@Body() req: LiveDeleteRequest) {
    const { recordId, cmd, isPurge } = liveDeleteRequest.parse(req);
    return this.liveService.finishLive(recordId, { exitCmd: exitCmd.parse(cmd), isPurge });
  }

  @Post('/tasks/finish')
  finish(@Body() req: LiveFinishRequest) {
    this.finalizer.finishLive(liveFinishRequest.parse(req)).catch((err) => {
      log.error('Error while finishing live', { stack_trace: stacktrace(err) });
    });
    return 'ok';
  }

  @Post('/tasks/adjust/node-group/:groupId')
  adjustNodeGroup(@Param('groupId') groupId: string) {
    this.rebalancer.drainByNodeGroup(groupId).catch((err) => {
      log.error('Error while adjusting nodeGroup', { stack_trace: stacktrace(err) });
    });
    return 'ok';
  }

  @Post('/tasks/adjust/node/:nodeId')
  adjustNode(@Param('nodeId') nodeId: string) {
    this.rebalancer.drainByNode(nodeId).catch((err) => {
      log.error('Error while adjusting node', { stack_trace: stacktrace(err) });
    });
    return 'ok';
  }
}
