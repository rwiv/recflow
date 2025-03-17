import { Module } from '@nestjs/common';
import { CriterionController } from './criterion.controller.js';
import { CriterionServiceModule } from '../service/criterion.service.module.js';
import { ConfigModule } from '../../common/config/config.module.js';

@Module({
  imports: [ConfigModule, CriterionServiceModule],
  controllers: [CriterionController],
})
export class CriterionWebModule {}
