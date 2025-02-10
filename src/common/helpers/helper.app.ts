import { Test, TestingModule } from '@nestjs/testing';
import { LiveModule } from '../../live/live.module.js';
import { ChannelModule } from '../../channel/channel.module.js';
import { NodeModule } from '../../node/node.module.js';
import { CommonModule } from '../module/common.module.js';

export function createTestApp(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [CommonModule, LiveModule, ChannelModule, NodeModule],
  }).compile();
}
