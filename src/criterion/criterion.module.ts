import { Module } from '@nestjs/common';
import { CriterionWebModule } from './web/criterion.web.module.js';

@Module({
  imports: [CriterionWebModule],
})
export class CriterionModule {}
