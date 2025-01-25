import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../common/common.module.js';
import { QueryConfig } from '../common/query.js';
import { WebhookMatcherChzzkMode1 } from './chzzk/webhook-matcher.chzzk.mode1.js';
import { WebhookMatcherChzzkMode2 } from './chzzk/webhook-matcher.chzzk.mode2.js';
import { WebhookMatcherChzzkMode3 } from './chzzk/webhook-matcher.chzzk.mode3.js';
import { WebhookMatcherChzzkMode4 } from './chzzk/webhook-matcher.chzzk.mode4.js';
import { WebhookMatcherSoopMode1 } from './soop/webhook-matcher.soop.mode1.js';

@Injectable()
export class WebhookFactory {
  constructor(@Inject(QUERY) private readonly query: QueryConfig) {}

  createChzzkWebhookMatcher() {
    switch (this.query.webhookMode) {
      case 'mode1':
        return new WebhookMatcherChzzkMode1(this.query);
      case 'mode2':
        return new WebhookMatcherChzzkMode2(this.query);
      case 'mode3':
        return new WebhookMatcherChzzkMode3(this.query);
      case 'mode4':
        return new WebhookMatcherChzzkMode4(this.query);
    }
  }

  createSoopWebhookMatcher() {
    return new WebhookMatcherSoopMode1(this.query);
    // switch (this.query.webhookMode) {
    //   case 'mode1':
    //     return new WebhookMatcherSoopMode1(this.query);
    //   default:
    //     throw Error('Unsupported webhook mode');
    // }
  }
}
