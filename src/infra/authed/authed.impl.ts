import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Cookie } from './types.js';
import { Authed, cookiesResponse, soopAccount, SoopAccount } from './authed.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';

@Injectable()
export class AuthedImpl implements Authed {
  private readonly authUrl: string;
  private readonly apiKey: string;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.authUrl = this.env.authed.url;
    this.apiKey = this.env.authed.apiKey;
  }

  async requestChzzkCookies(): Promise<Cookie[]> {
    const res = await fetch(`${this.authUrl}/api/chzzk/cookies/v1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) {
      throw new HttpRequestError('Failed to request chzzk cookies', res.status);
    }
    const cookieString = cookiesResponse.parse(await res.json()).cookies;
    return cookieString.split(';').map((cookie) => {
      const [name, value] = cookie.trim().split('=');
      return { name, value };
    });
  }

  async requestSoopAccount(): Promise<SoopAccount> {
    const res = await fetch(`${this.authUrl}/api/soop/accounts/v1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) {
      throw new HttpRequestError('Failed to request soop account', res.status);
    }
    return soopAccount.parse(await res.json());
  }
}
