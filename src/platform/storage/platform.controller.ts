import { Controller, Get, UseFilters } from '@nestjs/common';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { PlatformDto } from '../spec/storage/platform.dto.schema.js';
import { PlatformFinder } from './platform.finder.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/platforms')
export class PlatformController {
  constructor(private readonly platformFinder: PlatformFinder) {}

  @Get('/')
  findAll(): Promise<PlatformDto[]> {
    return this.platformFinder.findAll();
  }
}
