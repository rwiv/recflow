import { Injectable } from '@nestjs/common';
import { Cookie } from './types.js';
import { log } from 'jslog';
import { Authed, SoopCredential } from './authed.js';

@Injectable()
export class AuthedMock implements Authed {
  requestChzzkCookies(): Promise<Cookie[] | undefined> {
    log.info('MockAuthClient.requestChzzkCookies');
    return Promise.resolve(undefined);
  }

  requestSoopCred(): Promise<SoopCredential | undefined> {
    log.info('MockAuthClient.requestSoopCred');
    return Promise.resolve(undefined);
  }
}
