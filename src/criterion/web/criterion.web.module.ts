import { Module } from '@nestjs/common';
import { CriterionController } from './criterion.controller.js';
import { CriterionBusinessModule } from '../business/criterion.business.module.js';

@Module({
  imports: [CriterionBusinessModule],
  controllers: [CriterionController],
})
export class CriterionWebModule {}
