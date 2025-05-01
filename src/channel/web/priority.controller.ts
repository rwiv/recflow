import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { PriorityService } from '../service/priority.service.js';
import { priorityAppend, PriorityAppend, PriorityUpdate, priorityUpdate } from '../spec/priority.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels/priorities')
export class PriorityController {
  constructor(private readonly priService: PriorityService) {}

  @Get('/')
  tags() {
    return this.priService.findAll();
  }

  @Post('/')
  create(@Body() req: PriorityAppend) {
    return this.priService.create(priorityAppend.parse(req));
  }

  @Delete('/:priorityId')
  delete(@Param('priorityId') priorityId: string) {
    return this.priService.delete(priorityId);
  }

  @Put('/:priorityId')
  update(@Param('priorityId') priorityId: string, @Body() req: PriorityUpdate) {
    const update = priorityUpdate.parse(req);
    return this.priService.update(priorityId, update);
  }
}
