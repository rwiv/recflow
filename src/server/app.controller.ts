import { Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Streamq } from '../client/streamq.js';
import {
  ChzzkTargetRepository,
  SoopTargetRepository,
} from '../repository/types.js';
import {
  TARGET_REPOSITORY_CHZZK,
  TARGET_REPOSITORY_SOOP,
} from '../repository/stroage.module.js';
import { AllocatorChzzk } from '../observer/allocator.chzzk.js';
import { AllocatorSoop } from '../observer/allocator.soop.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly streamq: Streamq,
    @Inject(TARGET_REPOSITORY_CHZZK)
    private readonly chzzkTargets: ChzzkTargetRepository,
    private readonly chzzkAllocator: AllocatorChzzk,
    @Inject(TARGET_REPOSITORY_SOOP)
    private readonly soopTargets: SoopTargetRepository,
    private readonly soopAllocator: AllocatorSoop,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  health(): string {
    return 'hello';
  }

  @Get('/chzzk/lives')
  async chzzkLives(): Promise<string> {
    return 'hello';
  }

  @Post('/chzzk/:channelId')
  async chzzkPost(): Promise<string> {
    return 'hello';
  }
}
