import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters } from '@nestjs/common';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { HttpErrorFilter } from '@/common/error/error.filter.js';

import { Recnode } from '@/external/recnode/client/recnode.client.js';

import { NodeFinder } from '@/node/service/node.finder.js';
import { NodeWriter } from '@/node/service/node.writer.js';
import { NodeAppend, NodeUpdate, nodeAppend, nodeUpdate } from '@/node/spec/node.dto.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/nodes')
export class NodeController {
  constructor(
    private readonly finder: NodeFinder,
    private readonly writer: NodeWriter,
    private readonly recnode: Recnode,
  ) {}

  @Get('/')
  async nodes() {
    return this.finder.findAll({ group: true });
  }

  @Get('/status/:nodeName')
  async status(@Param('nodeName') nodeName: string) {
    const node = await this.finder.findByName(nodeName, {});
    if (!node) {
      throw NotFoundError.from('Node', 'name', nodeName);
    }
    return await this.recnode.getStatusWithStats(node.endpoint);
  }

  @Get('/:nodeId')
  async node(@Param('nodeId') nodeId: string) {
    return this.finder.findById(nodeId, { group: true });
  }

  @Post('/')
  create(@Body() append: NodeAppend) {
    return this.writer.create(nodeAppend.parse(append), true);
  }

  @Put('/:nodeId')
  update(@Param('nodeId') nodeId: string, @Body() req: NodeUpdate) {
    const update = nodeUpdate.parse(req);
    return this.writer.update(nodeId, update);
  }

  @Delete('/:nodeId')
  delete(@Param('nodeId') nodeId: string) {
    return this.writer.delete(nodeId);
  }
}
