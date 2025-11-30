import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { CriterionServiceModule } from '@/criterion/service/criterion.service.module.js';
import { CriterionController } from '@/criterion/web/criterion.controller.js';

@Module({
  imports: [ConfigModule, CriterionServiceModule],
  controllers: [CriterionController],
})
export class CriterionWebModule {}
