import { Module } from '@nestjs/common';
import { readEnv } from './env.js';

export const ENV = 'ENV';

const env = readEnv();

@Module({
  providers: [
    {
      provide: ENV,
      useValue: env,
    },
  ],
  exports: [ENV],
})
export class ConfigModule {}
