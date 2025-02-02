import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../../common/config.module.js';
import { QueryConfig } from '../../common/query.js';
import { ChzzkNodeSelectorMode1 } from './selector/chzzk/selector.chzzk.mode1.js';
import { ChzzkNodeSelectorMode2 } from './selector/chzzk/selector.chzzk.mode2.js';
import { ChzzkNodeSelectorMode3 } from './selector/chzzk/selector.chzzk.mode3.js';
import { ChzzkNodeSelectorMode4 } from './selector/chzzk/selector.chzzk.mode4.js';
import { SoopNodeSelectorMode1 } from './selector/soop/selector.soop.mode1.js';

@Injectable()
export class NodeFactory {
  constructor(@Inject(QUERY) private readonly query: QueryConfig) {}

  createChzzkNodeSelector() {
    switch (this.query.webhookMode) {
      case 'mode1':
        return new ChzzkNodeSelectorMode1(this.query);
      case 'mode2':
        return new ChzzkNodeSelectorMode2(this.query);
      case 'mode3':
        return new ChzzkNodeSelectorMode3(this.query);
      case 'mode4':
        return new ChzzkNodeSelectorMode4(this.query);
    }
  }

  createSoopNodeSelector() {
    return new SoopNodeSelectorMode1(this.query);
    // switch (this.query.webhookMode) {
    //   case 'mode1':
    //     return new WebhookMatcherSoopMode1(this.query);
    //   default:
    //     throw Error('Unsupported webhook mode');
    // }
  }
}
