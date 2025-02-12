import { Controller, UseFilters } from '@nestjs/common';
import { HttpErrorFilter } from '../../common/module/error.filter.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/task')
export class TaskController {}
