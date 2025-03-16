import { Injectable } from '@nestjs/common';
import { Cookie } from '../authed/types.js';
import { log } from 'jslog';
import { Stdl } from './types.js';

@Injectable()
export class StdlMock implements Stdl {
  async requestChzzkLive(url: string, uid: string, cookies: Cookie[] | undefined = undefined): Promise<void> {
    log.info(`MockStdlClient.requestChzzkLive(...)`, { url, uid, cookies });
  }

  async requestSoopLive(url: string, uid: string, cookies: Cookie[] | undefined = undefined): Promise<void> {
    log.info(`MockStdlClient.requestSoopLive(...)`, { url, uid, cookies });
  }
}
