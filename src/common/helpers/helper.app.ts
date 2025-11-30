import { INestApplication } from '@nestjs/common';
import { DynamicModule } from '@nestjs/common/interfaces/modules/dynamic-module.interface.js';
import { ForwardReference } from '@nestjs/common/interfaces/modules/forward-reference.interface.js';
import { Type } from '@nestjs/common/interfaces/type.interface.js';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types.js';

import { InitModule } from '@/common/init/init.module.js';

import { ChannelModule } from '@/channel/channel.module.js';

import { NodeModule } from '@/node/node.module.js';

import { LiveModule } from '@/live/live.module.js';

type Imports = Array<Type | DynamicModule | Promise<DynamicModule> | ForwardReference>;

const defaultImports = [InitModule, LiveModule, ChannelModule, NodeModule];

export function newTestingModuleRef(imports: Imports = defaultImports): Promise<TestingModule> {
  return Test.createTestingModule({ imports }).compile();
}

export async function newTestApp(moduleRef: TestingModule): Promise<INestApplication<App>> {
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
