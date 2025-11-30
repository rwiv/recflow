import { Module } from '@nestjs/common';

import { readEnv } from '@/common/config/env.js';

export const ENV = 'ENV';

@Module({
  providers: [
    {
      provide: ENV,
      useFactory: () => readEnv(),
    },
  ],
  exports: [ENV],
})
export class ConfigModule {}
