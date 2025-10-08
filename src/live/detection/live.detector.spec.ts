import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { dummyPlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.dummy.js';
import { dummyPlatformDto } from '../../platform/spec/storage/platform.dto.schema.dummy.js';
import { dummyChannelInfoChzzk } from '../../platform/spec/wapper/channel.dummy.js';
import { LiveDetector } from './live.detector.js';
import { LiveInitializer } from '../register/live.initializer.js';
import { LiveInitializerMock } from '../register/live.initializer.mock.js';
import { PlatformFetcherFake } from '../../platform/fetcher/fetcher.fake.js';
import { channelInfoToDto } from '../../channel/spec/channel.dto.schema.dummy.js';
import { ChannelInfo, channelLiveInfo } from '../../platform/spec/wapper/channel.js';

describe('LiveCoordinator', () => {
  let coordinator: LiveDetector;
  let fakeFetcher: PlatformFetcherFake;
  let mockLiveInit: LiveInitializer;
  let mockChannelFinder: { findFollowedChannels: MockInstance };
  let mockLiveFinder: { findByChannelSourceId: MockInstance };
  let mockFilter: { getFiltered: MockInstance };
  let mockHistoryRepo: object;

  beforeEach(() => {
    fakeFetcher = new PlatformFetcherFake();
    mockLiveInit = new LiveInitializerMock();
    mockChannelFinder = { findFollowedChannels: vi.fn() };
    mockLiveFinder = { findByChannelSourceId: vi.fn() };
    mockFilter = { getFiltered: vi.fn() };
    mockHistoryRepo = {};
    coordinator = new LiveDetector(
      mockChannelFinder as any,
      mockLiveFinder as any,
      mockLiveInit,
      fakeFetcher,
      mockFilter as any,
      mockHistoryRepo as any,
    );
  });

  describe('registerQueriedLives', () => {
    it('openLive가 true인 경우 등록', async () => {
      // Given
      const ch1 = dummyChannelInfoChzzk({ openLive: true });
      const ch2 = dummyChannelInfoChzzk({ openLive: false }, null);
      const ch3 = dummyChannelInfoChzzk({ openLive: true });
      const all = [ch1, ch2, ch3];

      mockChannelFinder.findFollowedChannels.mockResolvedValue(all.map((info: ChannelInfo) => channelInfoToDto(info)));
      mockLiveFinder.findByChannelSourceId.mockResolvedValue([]);
      fakeFetcher.setMockChannelInfos(all);

      // When
      await coordinator.checkFollowedLives();

      // Then
      expect(mockLiveInit.createNewLive).toHaveBeenNthCalledWith(1, { channelInfo: ch1, isFollowed: true });
      expect(mockLiveInit.createNewLive).toHaveBeenNthCalledWith(2, { channelInfo: ch3, isFollowed: true });
    });
  });

  describe('registerQueriedLives', () => {
    it('정상적인 라이브 등록 시나리오', async () => {
      // Given
      const criterion = dummyPlatformCriterionDto({
        platform: dummyPlatformDto({ name: 'chzzk' }),
        loggingOnly: false,
      });

      const ch1 = channelLiveInfo.parse(dummyChannelInfoChzzk());
      const ch2 = channelLiveInfo.parse(dummyChannelInfoChzzk());
      const ch3 = channelLiveInfo.parse(dummyChannelInfoChzzk());

      const queriedLives = [ch1.liveInfo, ch2.liveInfo, ch3.liveInfo];
      const filteredLives = [ch1.liveInfo, ch3.liveInfo];

      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockLiveFinder.findByChannelSourceId.mockResolvedValue([]);
      fakeFetcher.setMockLiveInfos(queriedLives);
      fakeFetcher.setMockChannelInfos([ch1, ch2, ch3]);

      // When
      await coordinator.checkQueriedLives(criterion);

      // Then
      expect(mockLiveInit.createNewLive).toHaveBeenNthCalledWith(1, { channelInfo: ch1, criterion });
      expect(mockLiveInit.createNewLive).toHaveBeenNthCalledWith(2, { channelInfo: ch3, criterion });
    });
  });
});
