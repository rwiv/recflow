import { Injectable } from '@nestjs/common';

import { EnumCheckError } from '@/utils/errors/errors/EnumCheckError.js';

import { platformNameEnum } from '@/platform/spec/storage/platform.enum.schema.js';
import { LiveInfo } from '@/platform/spec/wapper/live.js';

import { PlatformCriterionDto, chzzkCriterionDto, soopCriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

import { ChzzkLiveFilter } from '@/live/detection/filters/live-filter.chzzk.js';
import { SoopLiveFilter } from '@/live/detection/filters/live-filter.soop.js';

@Injectable()
export class PlatformLiveFilter {
  constructor(
    private readonly chzzkLiveFiler: ChzzkLiveFilter,
    private readonly soopLiveFilter: SoopLiveFilter,
  ) {}

  getFiltered(cr: PlatformCriterionDto, liveInfos: LiveInfo[]): Promise<LiveInfo[]> {
    if (cr.platform.name === platformNameEnum.Values.chzzk) {
      return this.chzzkLiveFiler.getFiltered(liveInfos, chzzkCriterionDto.parse(cr));
    } else if (cr.platform.name === platformNameEnum.Values.soop) {
      return this.soopLiveFilter.getFiltered(liveInfos, soopCriterionDto.parse(cr));
    } else {
      throw new EnumCheckError(`Unknown platformName: platformName=${cr.platform.name}`);
    }
  }
}
