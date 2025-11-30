import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters } from '@nestjs/common';

import { HttpErrorFilter } from '@/common/error/error.filter.js';

import { NodeGroupService } from '@/node/service/node-group.service.js';
import { NodeGroupAppend, NodeGroupUpdate, nodeGroupAppend, nodeGroupUpdate } from '@/node/spec/node.entity.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/node-groups')
export class NodeGroupController {
  constructor(private readonly ngService: NodeGroupService) {}

  @Get('/')
  tags() {
    return this.ngService.findAll();
  }

  @Post('/')
  create(@Body() req: NodeGroupAppend) {
    return this.ngService.create(nodeGroupAppend.parse(req));
  }

  @Delete('/:ngId')
  delete(@Param('ngId') ngId: string) {
    return this.ngService.delete(ngId);
  }

  @Put('/:ngId')
  update(@Param('ngId') ngId: string, @Body() req: NodeGroupUpdate) {
    const update = nodeGroupUpdate.parse(req);
    return this.ngService.update(ngId, update);
  }
}
