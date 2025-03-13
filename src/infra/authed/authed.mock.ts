import { Injectable } from '@nestjs/common';
import { Cookie } from './types.js';
import { log } from 'jslog';
import { Authed, SoopAccount } from './authed.js';

@Injectable()
export class AuthedMock implements Authed {
  requestChzzkCookies(): Promise<Cookie[]> {
    log.info('MockAuthClient.requestChzzkCookies');
    return Promise.resolve([]);
  }

  requestSoopAccount(): Promise<SoopAccount> {
    log.info('MockAuthClient.requestSoopCred');
    return Promise.resolve({ username: 'mock', password: 'mock' });
  }
}
