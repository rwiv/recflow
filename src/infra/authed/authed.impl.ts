import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config.module.js';
import { Env } from '../../common/env.js';
import { Cookie } from './types.js';
import { log } from 'jslog';
import { decrypt } from '../../utils/encrypt.js';
import { Authed, EncryptedResponse, SoopCredential } from './authed.js';

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
    const cookies = JSON.parse(decrypt(encRes.encrypted, this.enckey)) as Cookie[];
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
