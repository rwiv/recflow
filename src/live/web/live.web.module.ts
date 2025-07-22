import { Module } from '@nestjs/common';
import { LiveDataModule } from '../data/live.data.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';
import { LiveRegistryModule } from '../registry/live.registry.module.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [ConfigModule, InfraModule, LiveDataModule, LiveRegistryModule, PlatformModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
