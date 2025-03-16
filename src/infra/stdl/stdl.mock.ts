import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { Stdl } from './types.js';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';

@Injectable()
export class StdlMock implements Stdl {
  requestRecording(nodeEndpoint: string, live: LiveDto, cr?: CriterionDto): Promise<void> {
    log.info(`MockStdlClient.requestRecording(...)`, { nodeEndpoint });
    return Promise.resolve(undefined);
  }
}
