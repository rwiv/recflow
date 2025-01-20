import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { TargetRepositoryMem } from './target-repository.mem.js';

export const TARGET_REPOSITORY = 'TargetRepository';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TARGET_REPOSITORY,
      useClass: TargetRepositoryMem,
    },
  ],
  exports: [TARGET_REPOSITORY],
})
export class StorageModule {}
