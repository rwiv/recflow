import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { CriterionFinder } from '../service/criterion.finder.js';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { CriterionWriter } from '../service/criterion.writer.js';
import {
  ChzzkCriterionAppend,
  criterionUpdate,
  CriterionUpdate,
  SoopCriterionAppend,
} from '../spec/criterion.dto.schema.js';

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

  @Post('/chzzk')
  createChzzkCriterion(@Body() append: ChzzkCriterionAppend) {
    return this.criterionWriter.createChzzkCriterion(append);
  }

  @Post('/soop')
  createSoopCriterion(@Body() append: SoopCriterionAppend) {
    return this.criterionWriter.createSoopCriterion(append);
  }

  @Put('/:criterionId')
  update(@Param('criterionId') criterionId: string, @Body() req: CriterionUpdate) {
    const update = criterionUpdate.parse(req);
    return this.criterionWriter.update(criterionId, update);
  }

  @Delete('/:criterionId')
  delete(@Param('criterionId') criterionId: string) {
    return this.criterionWriter.delete(criterionId);
  }
}
