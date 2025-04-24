import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { NodeFinder } from '../service/node.finder.js';
import { NodeWriter } from '../service/node.writer.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { nodeAppend, NodeAppend, nodeUpdate, NodeUpdate } from '../spec/node.dto.schema.js';
import { NodeUpdater } from '../service/node.updater.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/nodes')
export class NodeController {
  constructor(
    private readonly finder: NodeFinder,
    private readonly writer: NodeWriter,
    private readonly updater: NodeUpdater,
  ) {}

  @Get('/')
  nodes() {
    return this.finder.findAll({ group: true, lives: true });
  }

  @Get('/groups')
  groups() {
    return this.finder.findAllGroups();
  }

  @Post('/')
  create(@Body() append: NodeAppend) {
    return this.writer.create(nodeAppend.parse(append), true);
  }

  @Put('/:nodeId')
  update(@Param('nodeId') nodeId: string, @Body() req: NodeUpdate) {
    const update = nodeUpdate.parse(req);
    return this.updater.update(nodeId, update);
  }

  @Delete('/:nodeId')
  delete(@Param('nodeId') nodeId: string) {
    return this.writer.delete(nodeId);
  }
}
