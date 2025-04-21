import { Inject, Injectable } from '@nestjs/common';
import { STDL } from '../../infra/infra.tokens.js';
import type { Stdl } from '../../infra/stdl/stdl.client.js';

@Injectable()
export class NodeManager {
  constructor(@Inject(STDL) private readonly stdl: Stdl) {}
}
