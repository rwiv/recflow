import { Test, TestingModule } from '@nestjs/testing';
import { LiveModule } from '../../live/live.module.js';
import { ChannelModule } from '../../channel/channel.module.js';
import { NodeModule } from '../../node/node.module.js';
import { InitModule } from '../init/init.module.js';

export function createTestApp(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [InitModule, LiveModule, ChannelModule, NodeModule],
  }).compile();
}
