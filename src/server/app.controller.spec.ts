import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { it, expect } from 'vitest';
import { ConfigModule } from '../common/common.module.js';
import { ClientModule } from '../client/client.module.js';

it('AppController', async () => {
  const app: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule, ClientModule],
    controllers: [AppController],
    providers: [AppService],
  }).compile();
  const appController = app.get(AppController);
  console.log('hello');
  expect(appController.getHello()).toBe('Hello World!');
});
