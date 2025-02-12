import { Injectable } from '@nestjs/common';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { PlatformName, platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';

@Injectable()
export class PlatformLiveFilter {
  constructor(
    private readonly chzzkLiveFiler: ChzzkLiveFilter,
    private readonly soopLiveFilter: SoopLiveFilter,
  ) {}
  getFiltered(platformName: PlatformName, infos: LiveInfo[]): Promise<LiveInfo[]> {
    if (platformName === platformNameEnum.Values.chzzk) {
      return this.chzzkLiveFiler.getFiltered(infos);
    } else if (platformName === platformNameEnum.Values.soop) {
      return this.soopLiveFilter.getFiltered(infos);
    } else {
      throw new EnumCheckError(`Unknown platformName: platformName=${platformName}`);
    }
  }
}
