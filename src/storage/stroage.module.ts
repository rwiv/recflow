import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { StorageFactory } from './storage.factory.js';

export const TARGET_REPOSITORY = 'TargetRepository';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageFactory,
    {
      provide: TARGET_REPOSITORY,
      useFactory: (factory: StorageFactory) => {
        return factory.createTargetRepository();
      },
      inject: [StorageFactory],
    },
  ],
  exports: [TARGET_REPOSITORY],
})
export class StorageModule {}
