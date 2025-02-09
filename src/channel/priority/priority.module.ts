import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { ChannelPriorityEvaluator } from './priority.evaluator.js';

@Module({
  imports: [ConfigModule],
  providers: [ChannelPriorityEvaluator],
  exports: [ChannelPriorityEvaluator],
})
export class ChannelPriorityModule {}
