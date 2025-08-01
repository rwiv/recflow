import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { GradeService } from '../service/grade.service.js';
import { gradeAppend, GradeAppend, GradeUpdate, gradeUpdate } from '../spec/grade.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels/grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Get('/')
  tags() {
    return this.gradeService.findAll();
  }

  @Post('/')
  create(@Body() req: GradeAppend) {
    return this.gradeService.create(gradeAppend.parse(req));
  }

  @Delete('/:gradeId')
  delete(@Param('gradeId') gradeId: string) {
    return this.gradeService.delete(gradeId);
  }

  @Put('/:gradeId')
  update(@Param('gradeId') gradeId: string, @Body() req: GradeUpdate) {
    const update = gradeUpdate.parse(req);
    return this.gradeService.update(gradeId, update);
  }
}
