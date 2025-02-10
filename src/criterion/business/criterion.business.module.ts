import { Module } from '@nestjs/common';
import { CriterionRepository } from '../persistence/criterion.repository.js';

@Module({
  imports: [CriterionRepository],
  providers: [],
  exports: [],
})
export class CriterionBusinessModule {}
