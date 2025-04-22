import { Injectable } from '@nestjs/common';
import { Cookie } from './types.js';
import { log } from 'jslog';
import { Authed } from './authed.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

@Injectable()
export class AuthedMock implements Authed {
  requestCookie(platform: PlatformName): Promise<string> {
    log.info(`MockAuthClient.getCookie(${platform})`);
    return Promise.resolve('');
  }

  requestChzzkCookies(): Promise<Cookie[]> {
    log.info('MockAuthClient.requestChzzkCookies');
    return Promise.resolve([]);
  }

  requestSoopCookies(): Promise<Cookie[]> {
    log.info('MockAuthClient.requestChzzkCookies');
    return Promise.resolve([]);
  }
}
