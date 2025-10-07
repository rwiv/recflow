import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { mockPlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.mocks.js';
import { mockPlatformDto } from '../../platform/spec/storage/platform.dto.schema.mocks.js';
import { dummyChzzkChannelLiveInfo } from '../../platform/spec/wapper/channel.mocks.js';
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
      const mockCriterion = mockPlatformCriterionDto({
        platform: mockPlatformDto({ name: 'chzzk' }),
        loggingOnly: false,
      });

      const mockChannel0 = dummyChzzkChannelLiveInfo();
      const mockChannel1 = dummyChzzkChannelLiveInfo();
      const mockChannel2 = dummyChzzkChannelLiveInfo();

      const queriedLives = [mockChannel0.liveInfo, mockChannel1.liveInfo, mockChannel2.liveInfo];
      const filteredLives = [mockChannel0.liveInfo, mockChannel2.liveInfo];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockFetcher.fetchChannel.mockResolvedValueOnce(mockChannel0).mockResolvedValueOnce(mockChannel2);

      // When
      await coordinator.checkQueriedLives(mockCriterion);

      // Then
      expect(mockLiveInitializer.createNewLive).toHaveBeenNthCalledWith(1, {
        channelInfo: mockChannel0,
        criterion: mockCriterion,
      });
      expect(mockLiveInitializer.createNewLive).toHaveBeenNthCalledWith(2, {
        channelInfo: mockChannel2,
        criterion: mockCriterion,
      });
    });

    it('loggingOnly가 true일 때', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto({
        platform: mockPlatformDto({ name: 'chzzk' }),
        loggingOnly: true,
      });

      const mockChannel0 = dummyChzzkChannelLiveInfo();
      const mockChannel1 = dummyChzzkChannelLiveInfo();
      const mockChannel2 = dummyChzzkChannelLiveInfo();
      const mockChannel3 = dummyChzzkChannelLiveInfo();

      const queriedLives = [mockChannel0.liveInfo, mockChannel1.liveInfo, mockChannel2.liveInfo, mockChannel3.liveInfo];
      const filteredLives = [
        mockChannel0.liveInfo,
        mockChannel1.liveInfo,
        mockChannel2.liveInfo,
        mockChannel3.liveInfo,
      ];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockFetcher.fetchChannel
        .mockResolvedValueOnce(mockChannel0)
        .mockResolvedValueOnce(mockChannel1)
        .mockResolvedValueOnce(mockChannel2)
        .mockResolvedValueOnce(mockChannel3);
      mockHistoryRepo.exists
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      // When
      await coordinator.checkQueriedLives(mockCriterion);

      // Then
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(1, 'chzzk', mockChannel0.liveInfo);
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(2, 'chzzk', mockChannel2.liveInfo);
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(3, 'chzzk', mockChannel3.liveInfo);
    });
  });
});
