import { Controller, Delete, Get, Param, UseFilters } from '@nestjs/common';
import { CriterionFinder } from '../service/criterion.finder.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { CriterionWriter } from '../service/criterion.writer.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/criteria')
export class CriterionController {
  constructor(
    private readonly criterionFinder: CriterionFinder,
    private readonly criterionWriter: CriterionWriter,
  ) {}

  @Get('/chzzk')
  findChzzkCriteria() {
    return this.criterionFinder.findChzzkCriteria();
  }

  @Get('/soop')
  findSoopCriteria() {
    return this.criterionFinder.findSoopCriteria();
  }

  @Delete('/delete/:criterionId')
  delete(@Param('criterionId') criterionId: string) {
    return this.criterionWriter.delete(criterionId);
  }
}
