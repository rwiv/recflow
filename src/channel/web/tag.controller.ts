import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { TagWriter } from '../business/tag.writer.js';
import { TagEntAttachment, TagEntDetachment, TagEntUpdate } from '../persistence/tag.types.js';
import { TagFinder } from '../business/tag.finder.js';

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
