import { Injectable } from '@nestjs/common';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';
import {
  chzzkCriterionDto,
  PlatformCriterionDto,
  soopCriterionDto,
} from '../../criterion/spec/criterion.dto.schema.js';

@Injectable()
export class PlatformLiveFilter {
  constructor(
    private readonly chzzkLiveFiler: ChzzkLiveFilter,
    private readonly soopLiveFilter: SoopLiveFilter,
  ) {}

  getFiltered(cr: PlatformCriterionDto, infos: LiveInfo[]): Promise<LiveInfo[]> {
    if (cr.platform.name === platformNameEnum.Values.chzzk) {
      return this.chzzkLiveFiler.getFiltered(infos, chzzkCriterionDto.parse(cr));
    } else if (cr.platform.name === platformNameEnum.Values.soop) {
      return this.soopLiveFilter.getFiltered(infos, soopCriterionDto.parse(cr));
    } else {
      throw new EnumCheckError(`Unknown platformName: platformName=${cr.platform.name}`);
    }
  }
}
