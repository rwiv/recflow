import { Controller, Get, UseFilters } from '@nestjs/common';
import { CriterionFinder } from '../service/criterion.finder.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/criteria')
export class CriterionController {
  constructor(private readonly criterionFinder: CriterionFinder) {}

  @Get('/chzzk')
  findChzzkCriteria() {
    return this.criterionFinder.findChzzkCriteria();
  }

  @Get('/soop')
  findSoopCriteria() {
    return this.criterionFinder.findSoopCriteria();
  }
}
