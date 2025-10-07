import { Body, Controller, Delete, Get, Inject, Post, Query, UseFilters } from '@nestjs/common';
import { LiveRegistrar } from '../register/live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { exitCmd } from '../spec/event.schema.js';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinder } from '../data/live.finder.js';
import { liveAppendRequest, LiveAppendRequest, liveDeleteRequest, LiveDeleteRequest } from './live.web.schema.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { DrainArgs, drainArgs } from '../coord/live.drainer.js';
import { Queue } from 'bullmq';
import { getJobOpts } from '../../task/schedule/task.utils.js';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { NODE_DRAIN_NAME } from '../../task/node/node.tasks.constants.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveInitializer } from '../register/live.initializer.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/lives')
export class LiveController {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(TASK_REDIS) private readonly taskRedis: Redis,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly liveInitializer: LiveInitializer,
    private readonly fetcher: PlatformFetcher,
    private readonly liveFinder: LiveFinder,
  ) {}

  @Get('/')
  allActives(@Query('nodeId') nodeId?: string): Promise<LiveDto[]> {
    if (nodeId) {
      return this.liveFinder.findByNodeId(nodeId, { nodes: true, nodeGroup: true });
    }
    return this.liveFinder.findAllActives({ nodes: true, nodeGroup: true });
  }

  @Get('/all')
  all(): Promise<LiveDto[]> {
    return this.liveFinder.findAll({ nodes: true, nodeGroup: true });
  }

  @Post('/')
  async add(@Body() req: LiveAppendRequest) {
    const append = liveAppendRequest.parse(req);
    const channel = await this.fetcher.fetchChannelNotNull(append.platformName, append.sourceId, true);
    if (!channel.liveInfo) {
      throw new NotFoundError('Channel is not live');
    }
    return this.liveInitializer.createNewLive({
      channelInfo: channelLiveInfo.parse(channel),
      stream: req.stream ?? undefined,
    });
  }

  @Delete('/')
  async delete(@Body() req: LiveDeleteRequest) {
    const { recordId, cmd, isPurge } = liveDeleteRequest.parse(req);
    return this.liveRegistrar.finishLive({ recordId, exitCmd: exitCmd.parse(cmd), isPurge });
  }

  @Post('/drain')
  async drainNodeGroup(@Body() req: DrainArgs) {
    const taskName = NODE_DRAIN_NAME;
    const queue = new Queue(taskName, { connection: this.taskRedis });
    const args = drainArgs.parse(req);
    await queue.add(taskName, { meta: {}, args }, getJobOpts(this.env));
  }
}
