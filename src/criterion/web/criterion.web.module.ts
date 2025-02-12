import { Module } from '@nestjs/common';
import { CriterionController } from './criterion.controller.js';
import { CriterionServiceModule } from '../service/criterion.service.module.js';

@Module({
  imports: [CriterionServiceModule],
  controllers: [CriterionController],
})
export class CriterionWebModule {}
