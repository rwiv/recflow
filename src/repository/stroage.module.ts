import { Module } from '@nestjs/common';
import { TargetRepositoryMemChzzk } from './target-repository.mem.chzzk.js';
import { ConfigModule } from '../common/common.module.js';
import { TargetRepositoryMemSoop } from './target-repository.mem.soop.js';

export const TARGET_REPOSITORY_CHZZK = 'ChzzkTargetRepository';
export const TARGET_REPOSITORY_SOOP = 'SoopTargetRepository';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TARGET_REPOSITORY_CHZZK,
      useClass: TargetRepositoryMemChzzk,
    },
    {
      provide: TARGET_REPOSITORY_SOOP,
      useClass: TargetRepositoryMemSoop,
    },
  ],
  exports: [TARGET_REPOSITORY_CHZZK, TARGET_REPOSITORY_SOOP],
})
export class StorageModule {}
