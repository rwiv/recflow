import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { NodeStatus, Stdl } from './types.js';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

@Injectable()
export class StdlMock implements Stdl {
  async requestRecording(nodeEndpoint: string, live: LiveDto, cr?: CriterionDto): Promise<void> {
    log.info(`MockStdlClient.requestRecording(...)`, { nodeEndpoint });
    await Promise.resolve(undefined);
  }

  async cancel(endpoint: string, platform: PlatformName, uid: string): Promise<void> {
    log.info(`MockStdlClient.cancel(...)`, { endpoint, platform, uid });
    await Promise.resolve(undefined);
  }

  getStatus(endpoint: string): Promise<NodeStatus[]> {
    log.info(`MockStdlClient.getStatus(...)`, { endpoint });
    return Promise.resolve([]);
  }
}
