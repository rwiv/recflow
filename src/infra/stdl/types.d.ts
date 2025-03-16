import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';

export interface ChzzkLiveRequest {
  uid: string;
  cookies?: string;
}

export interface SoopLiveRequest {
  userId: string;
  cookies?: string;
}

export interface Stdl {
  requestRecording(nodeEndpoint: string, live: LiveDto, cr?: CriterionDto): Promise<void>;
}
