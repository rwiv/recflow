import { Test, TestingModule } from '@nestjs/testing';
import { LiveController } from './live.controller.js';
import { it, expect } from 'vitest';
import { ConfigModule } from '../../common/config.module.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveServiceModule } from '../service/service.module.js';
import { LiveSyncModule } from '../sync/sync.module.js';

it('AppController', async () => {
  const app: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule, InfraModule, LiveServiceModule, LiveSyncModule],
    controllers: [LiveController],
    providers: [],
  }).compile();
  const appController = app.get(LiveController);
  expect(appController.health()).toBe('hello');
});
