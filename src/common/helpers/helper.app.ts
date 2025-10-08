import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types.js';
import { LiveModule } from '../../live/live.module.js';
import { ChannelModule } from '../../channel/channel.module.js';
import { NodeModule } from '../../node/node.module.js';
import { InitModule } from '../init/init.module.js';
import { INestApplication } from '@nestjs/common';

export function newTestingModuleRef(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [InitModule, LiveModule, ChannelModule, NodeModule],
  }).compile();
}

export async function newTestApp(moduleRef: TestingModule): Promise<INestApplication<App>> {
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
