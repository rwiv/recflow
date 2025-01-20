import { Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Streamq } from '../client/streamq.js';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(ENV) private readonly env: Env,
    private readonly streamq: Streamq,
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
