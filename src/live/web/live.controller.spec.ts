import { Test, TestingModule } from '@nestjs/testing';
import { LiveController } from './live.controller.js';
import { it, expect } from 'vitest';
import { ConfigModule } from '../../common/config.module.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveBusinessModule } from '../business/business.module.js';
import { LiveSchedulerModule } from '../scheduler/scheduler.module.js';

it('AppController', async () => {
  const app: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule, InfraModule, LiveBusinessModule, LiveSchedulerModule],
    controllers: [LiveController],
    providers: [],
  }).compile();
  const appController = app.get(LiveController);
  expect(appController.health()).toBe('hello');
});
