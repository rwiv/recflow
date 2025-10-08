import { beforeAll, describe, it } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { newTestingModuleRef } from '../../common/helpers/helper.app.js';
import { ChzzkFetcher } from './platforms/fetcher.chzzk.js';
import { SoopFetcher } from './platforms/fetcher.soop.js';
import { PlatformFetcherImpl } from './fetcher.impl.js';
import { PlatformFetcher } from './fetcher.js';

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
