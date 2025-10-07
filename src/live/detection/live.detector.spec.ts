import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { dummyPlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.dummy.js';
import { dummyPlatformDto } from '../../platform/spec/storage/platform.dto.schema.dummy.js';
import { dummyChzzkChannelLiveInfo } from '../../platform/spec/wapper/channel.dummy.js';
import { LiveDetector } from './live.detector.js';

describe('LiveCoordinator', () => {
  let coordinator: LiveDetector;
  let mockFetcher: { fetchLives: MockInstance; fetchChannel: MockInstance };
  let mockLiveInitializer: { createNewLive: MockInstance };
  let mockChannelFinder: { findFollowedChannels: MockInstance };
  let mockLiveFinder: { findByChannelSourceId: MockInstance };
  let mockFilter: { getFiltered: MockInstance };
  let mockHistoryRepo: { exists: MockInstance; set: MockInstance };

  beforeEach(() => {
    mockFetcher = { fetchLives: vi.fn(), fetchChannel: vi.fn() };
    mockLiveInitializer = { createNewLive: vi.fn() };
    mockChannelFinder = { findFollowedChannels: vi.fn() };
    mockLiveFinder = { findByChannelSourceId: vi.fn() };
    mockFilter = { getFiltered: vi.fn() };
    mockHistoryRepo = { exists: vi.fn(), set: vi.fn() };
    coordinator = new LiveDetector(
      mockChannelFinder as any,
      mockLiveFinder as any,
      mockLiveInitializer as any,
      mockFetcher as any,
      mockFilter as any,
      mockHistoryRepo as any,
    );
  });

  describe('registerQueriedLives', () => {
    it('openLive가 true인 경우 등록', async () => {
      // Given
      const chInfo0 = dummyChzzkChannelLiveInfo({ openLive: true });
      const chInfo1 = dummyChzzkChannelLiveInfo({ openLive: false });
      const chInfo2 = dummyChzzkChannelLiveInfo({ openLive: true });

      mockChannelFinder.findFollowedChannels.mockResolvedValue([chInfo0, chInfo1, chInfo2]);
      mockLiveFinder.findByChannelSourceId.mockResolvedValue([]);
      mockFetcher.fetchChannel
        .mockResolvedValueOnce(chInfo0)
        .mockResolvedValueOnce(chInfo0)
        .mockResolvedValueOnce(chInfo1)
        .mockResolvedValueOnce(chInfo2)
        .mockResolvedValueOnce(chInfo2);

      // When
      await coordinator.checkFollowedLives();

      // Then
      expect(mockLiveInitializer.createNewLive).toHaveBeenNthCalledWith(1, {
        channelInfo: chInfo2,
        isFollowed: true,
      });
    });
  });

  describe('registerQueriedLives', () => {
    it('정상적인 라이브 등록 시나리오', async () => {
      // Given
      const cr = dummyPlatformCriterionDto({
        platform: dummyPlatformDto({ name: 'chzzk' }),
        loggingOnly: false,
      });

      const ch0 = dummyChzzkChannelLiveInfo();
      const ch1 = dummyChzzkChannelLiveInfo();
      const ch2 = dummyChzzkChannelLiveInfo();

      const queriedLives = [ch0.liveInfo, ch1.liveInfo, ch2.liveInfo];
      const filteredLives = [ch0.liveInfo, ch2.liveInfo];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockFetcher.fetchChannel.mockResolvedValueOnce(ch0).mockResolvedValueOnce(ch2);

      // When
      await coordinator.checkQueriedLives(cr);

      // Then
      expect(mockLiveInitializer.createNewLive).toHaveBeenNthCalledWith(1, {
        channelInfo: ch0,
        criterion: cr,
      });
      expect(mockLiveInitializer.createNewLive).toHaveBeenNthCalledWith(2, {
        channelInfo: ch2,
        criterion: cr,
      });
    });

    it('loggingOnly가 true일 때', async () => {
      // Given
      const cr = dummyPlatformCriterionDto({
        platform: dummyPlatformDto({ name: 'chzzk' }),
        loggingOnly: true,
      });

      const ch0 = dummyChzzkChannelLiveInfo();
      const ch1 = dummyChzzkChannelLiveInfo();
      const ch2 = dummyChzzkChannelLiveInfo();
      const ch3 = dummyChzzkChannelLiveInfo();

      const queriedLives = [ch0.liveInfo, ch1.liveInfo, ch2.liveInfo, ch3.liveInfo];
      const filteredLives = [ch0.liveInfo, ch1.liveInfo, ch2.liveInfo, ch3.liveInfo];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockFetcher.fetchChannel
        .mockResolvedValueOnce(ch0)
        .mockResolvedValueOnce(ch1)
        .mockResolvedValueOnce(ch2)
        .mockResolvedValueOnce(ch3);
      mockHistoryRepo.exists
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      // When
      await coordinator.checkQueriedLives(cr);

      // Then
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(1, 'chzzk', ch0.liveInfo);
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(2, 'chzzk', ch2.liveInfo);
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(3, 'chzzk', ch3.liveInfo);
    });
  });
});
