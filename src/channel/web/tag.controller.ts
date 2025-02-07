import { Body, Controller, Get, Param, Patch, Put, UseFilters } from '@nestjs/common';
import { TagWriter } from '../business/tag.writer.js';
import { TagEntAttachment, TagEntDetachment } from '../persistence/tag.types.js';
import { TagFinder } from '../business/tag.finder.js';
import { HttpErrorFilter } from '../../common/error.filter.js';
import { TagEntUpdate } from '../persistence/tag.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels/tags')
export class TagController {
  constructor(
    private readonly tagWriter: TagWriter,
    private readonly tagFinder: TagFinder,
  ) {}

  @Put('/')
  updateTag(@Body() req: TagEntUpdate) {
    return this.tagWriter.update(req);
  }

  @Patch('/attach')
  attachTag(@Body() req: TagEntAttachment) {
    return this.tagWriter.attach(req);
  }

  @Patch('/detach')
  detachTag(@Body() req: TagEntDetachment) {
    return this.tagWriter.detach(req);
  }

  @Get('/')
  tags() {
    return this.tagFinder.findAll();
  }

  @Get('/{tagId}')
  tag(@Param('tagId') tagId: string) {
    return this.tagFinder.findById(tagId);
  }
}
