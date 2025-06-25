import { Module } from '@nestjs/common';
import { readEnv } from './env.js';

export const ENV = 'ENV';

@Module({
  providers: [
    {
      provide: ENV,
      useValue: readEnv(),
    },
  ],
  exports: [ENV],
})
export class ConfigModule {}
