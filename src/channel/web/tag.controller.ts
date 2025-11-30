import { Body, Controller, Get, Param, Patch, Post, Put, UseFilters } from '@nestjs/common';

import { HttpErrorFilter } from '@/common/error/error.filter.js';

import { TagFinder } from '@/channel/service/tag.finder.js';
import { TagWriter } from '@/channel/service/tag.writer.js';
import {
  TagAppend,
  TagAttachment,
  TagDetachment,
  TagUpdate,
  tagAppend,
  tagAttachment,
  tagDetachment,
  tagUpdate,
} from '@/channel/spec/tag.dto.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels/tags')
export class TagController {
  constructor(
    private readonly tagWriter: TagWriter,
    private readonly tagFinder: TagFinder,
  ) {}

  @Get('/')
  tags() {
    return this.tagFinder.findAll();
  }

  @Post('/')
  create(@Body() req: TagAppend) {
    return this.tagWriter.create(tagAppend.parse(req));
  }

  @Patch('/attach')
  attachTag(@Body() req: TagAttachment) {
    return this.tagWriter.attach(tagAttachment.parse(req));
  }

  @Patch('/detach')
  detachTag(@Body() req: TagDetachment) {
    return this.tagWriter.detach(tagDetachment.parse(req));
  }

  @Put('/:tagId')
  update(@Param('tagId') tagId: string, @Body() req: TagUpdate) {
    const update = tagUpdate.parse(req);
    return this.tagWriter.update(tagId, update);
  }
}
