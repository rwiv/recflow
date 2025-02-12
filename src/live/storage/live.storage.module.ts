import { Module } from '@nestjs/common';
import { LiveRepository } from './live.repository.js';

@Module({
  imports: [],
  providers: [LiveRepository],
  exports: [LiveRepository],
})
export class LiveStorageModule {}
