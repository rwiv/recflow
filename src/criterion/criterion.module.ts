import { Module } from '@nestjs/common';

import { CriterionWebModule } from '@/criterion/web/criterion.web.module.js';

@Module({
  imports: [CriterionWebModule],
})
export class CriterionModule {}
