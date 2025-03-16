import { Injectable } from '@nestjs/common';
import { Cookie } from './types.js';
import { log } from 'jslog';
import { Authed } from './authed.js';

@Injectable()
export class AuthedMock implements Authed {
  requestChzzkCookies(): Promise<Cookie[]> {
    log.info('MockAuthClient.requestChzzkCookies');
    return Promise.resolve([]);
  }

  requestSoopCookies(): Promise<Cookie[]> {
    log.info('MockAuthClient.requestChzzkCookies');
    return Promise.resolve([]);
  }
}
