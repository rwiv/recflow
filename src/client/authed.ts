import { log } from 'jslog';
import { Cookie } from './types.common.js';
import { decrypt } from '../common/encrypt.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';

export interface Authed {
  requestChzzkCookies(): Promise<Cookie[] | undefined>;
  requestSoopCred(): Promise<SoopCredential | undefined>;
}

interface EncryptedResponse {
  encrypted: string;
}

export interface SoopCredential {
  username: string;
  password: string;
}

@Injectable()
export class AuthedImpl implements Authed {
  private readonly authUrl: string;
  private readonly enckey: string;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.authUrl = this.env.authedUrl;
    this.enckey = this.env.authedEncKey;
    if (this.enckey.length !== 32) {
      throw new Error('enckey must be 32 bytes');
    }
  }

  async requestChzzkCookies(): Promise<Cookie[] | undefined> {
    const res = await fetch(`${this.authUrl}/chzzk/cookies/v1`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    });
    if (!res.ok) {
      log.error('Failed to request chzzk cookies', { status: res.status });
      return undefined;
    }
    const encRes = (await res.json()) as EncryptedResponse;
    const cookies = JSON.parse(
      decrypt(encRes.encrypted, this.enckey),
    ) as Cookie[];
    if (cookies.length === 0) {
      log.error('No chzzk cookies');
      return undefined;
    }
    return cookies;
  }

  async requestSoopCred(): Promise<SoopCredential | undefined> {
    const res = await fetch(`${this.authUrl}/soop/cred/v1`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    });
    if (!res.ok) {
      log.error('Failed to request chzzk cookies', { status: res.status });
      return undefined;
    }
    const encRes = (await res.json()) as EncryptedResponse;
    return JSON.parse(decrypt(encRes.encrypted, this.enckey)) as SoopCredential;
  }
}

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
