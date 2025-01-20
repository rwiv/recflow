import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { it, expect } from 'vitest';
import { ConfigModule } from '../common/common.module.js';
import { ClientModule } from '../client/client.module.js';
import { StorageModule } from '../storage/stroage.module.js';
import { ObserverModule } from '../observer/observer.module.js';

it('AppController', async () => {
  const app: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule, ClientModule, StorageModule, ObserverModule],
    controllers: [AppController],
    providers: [],
  }).compile();
  const appController = app.get(AppController);
  expect(appController.health()).toBe('hello');
});
