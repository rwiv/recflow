import { Module } from '@nestjs/common';
import { readQueryConfig } from './query.js';
import { readEnv } from './env.js';

export const ENV = 'ENV';
export const QUERY = 'QUERY';

const env = readEnv();
const query = readQueryConfig(env.configPath);

@Module({
  providers: [
    {
      provide: ENV,
      useValue: env,
    },
    {
      provide: QUERY,
      useValue: query,
    },
  ],
  exports: [ENV, QUERY],
})
export class ConfigModule {}
