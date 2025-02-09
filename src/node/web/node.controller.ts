import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { NodeFinder } from '../business/node.finder.js';
import { NodeWriter } from '../business/node.writer.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { nodeAppend, NodeAppend } from '../business/node.business.schema.js';
import { NodeGroupEnt } from '../persistence/node.persistence.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/nodes')
export class NodeController {
  constructor(
    private readonly finder: NodeFinder,
    private readonly writer: NodeWriter,
  ) {}

  @Get('/')
  nodes() {
    return this.finder.findAll();
  }

  @Post('/')
  create(@Body() append: NodeAppend) {
    return this.writer.create(nodeAppend.parse(append), true);
  }

  f(node: NodeGroupEnt) {}
}
