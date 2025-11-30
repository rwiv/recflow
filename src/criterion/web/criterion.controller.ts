import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters } from '@nestjs/common';

import { HttpErrorFilter } from '@/common/error/error.filter.js';

import { CriterionFinder } from '@/criterion/service/criterion.finder.js';
import { CriterionWriter } from '@/criterion/service/criterion.writer.js';
import {
  ChzzkCriterionAppend,
  CriterionUpdate,
  SoopCriterionAppend,
  criterionUpdate,
} from '@/criterion/spec/criterion.dto.schema.js';
import { CriterionUnitEntAppend } from '@/criterion/spec/criterion.entity.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/criteria')
export class CriterionController {
  constructor(
    private readonly criterionFinder: CriterionFinder,
    private readonly criterionWriter: CriterionWriter,
  ) {}

  @Post('/units')
  createUnit(@Body() append: CriterionUnitEntAppend) {
    return this.criterionWriter.createUnit(append);
  }

  @Delete('/units/:unitId')
  deleteUnit(@Param('unitId') unitId: string) {
    return this.criterionWriter.deleteUnit(unitId);
  }

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
