import { Module } from '@nestjs/common';
import { LiveDataModule } from '../data/live.data.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';
import { LiveRegisterModule } from '../register/live.register.module.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [ConfigModule, InfraModule, LiveDataModule, LiveRegisterModule, PlatformModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
