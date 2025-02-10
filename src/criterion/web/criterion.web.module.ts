import { Module } from '@nestjs/common';
import { CriterionController } from './criterion.controller.js';

@Module({
  imports: [],
  controllers: [CriterionController],
})
export class CriterionWebModule {}
