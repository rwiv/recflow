import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { InfraModule } from '@/infra/infra.module.js';

import { PlatformModule } from '@/platform/platform.module.js';

import { LiveDataModule } from '@/live/data/live.data.module.js';
import { LiveRegisterModule } from '@/live/register/live.register.module.js';
import { LiveController } from '@/live/web/live.controller.js';

@Module({
  imports: [ConfigModule, InfraModule, LiveDataModule, LiveRegisterModule, PlatformModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
