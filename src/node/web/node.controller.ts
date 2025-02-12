import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { NodeFinder } from '../app/node.finder.js';
import { NodeWriter } from '../app/node.writer.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { nodeAppend, NodeAppend } from '../spec/node.dto.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/nodes')
export class NodeController {
  constructor(
    private readonly finder: NodeFinder,
    private readonly writer: NodeWriter,
  ) {}

  @Get('/')
  nodes() {
    return this.finder.findAll(true, true);
  }

  @Get('/groups')
  groups() {
    return this.finder.findAllGroups();
  }

  @Post('/')
  create(@Body() append: NodeAppend) {
    return this.writer.create(nodeAppend.parse(append), true);
  }
}
