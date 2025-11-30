import { TestingModule } from '@nestjs/testing';
import { beforeAll, describe, it } from 'vitest';

import { newTestingModuleRef } from '@/common/helpers/helper.app.js';

import { PlatformFetcherImpl } from '@/platform/fetcher/fetcher.impl.js';
import { PlatformFetcher } from '@/platform/fetcher/fetcher.js';
import { ChzzkFetcher } from '@/platform/fetcher/platforms/fetcher.chzzk.js';
import { SoopFetcher } from '@/platform/fetcher/platforms/fetcher.soop.js';

describe.skip('PlatformFetcher', () => {
  let moduleRef: TestingModule;
  let fetcher: PlatformFetcher;

  beforeAll(async () => {
    moduleRef = await newTestingModuleRef();
    fetcher = new PlatformFetcherImpl(moduleRef.get(ChzzkFetcher), moduleRef.get(SoopFetcher));
  });

  it('fetchChannel', async () => {
    const platform = 'chzzk';
    const sourceId = '';
    const channelInfo = await fetcher.fetchChannel(platform, sourceId, true);
    console.log(channelInfo);
  });
});
