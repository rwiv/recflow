import { Body, Controller, Get, Patch, Put, UseFilters } from '@nestjs/common';
import { TagWriter } from '../business/tag.writer.js';
import { TagFinder } from '../business/tag.finder.js';
import { HttpErrorFilter } from '../../../common/module/error.filter.js';
import { tagEntUpdate, TagEntUpdate } from '../persistence/tag.persistence.schema.js';
import {
  tagAttachment,
  TagAttachment,
  tagDetachment,
  TagDetachment,
} from '../business/tag.business.schema.js';

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

  @Put('/')
  updateTag(@Body() req: TagEntUpdate) {
    return this.tagWriter.update(tagEntUpdate.parse(req));
  }

  @Patch('/attach')
  attachTag(@Body() req: TagAttachment) {
    return this.tagWriter.attach(tagAttachment.parse(req));
  }

  @Patch('/detach')
  detachTag(@Body() req: TagDetachment) {
    return this.tagWriter.detach(tagDetachment.parse(req));
  }
}
