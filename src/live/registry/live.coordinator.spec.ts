import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { mockPlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.mocks.js';
import { mockPlatformDto } from '../../platform/spec/storage/platform.dto.schema.mocks.js';
import { mockChzzkChannelLiveInfo } from '../../platform/spec/wapper/channel.mocks.js';
import { LiveCoordinator } from './live.coordinator.js';

describe('LiveCoordinator', () => {
  let coordinator: LiveCoordinator;
  let mockFetcher: { fetchLives: MockInstance; fetchChannel: MockInstance };
  let mockLiveRegistrar: { register: MockInstance };
  let mockChannelFinder: { findFollowedChannels: MockInstance };
  let mockLiveFinder: { findByPid: MockInstance };
  let mockFilter: { getFiltered: MockInstance };
  let mockHistoryRepo: { exists: MockInstance; set: MockInstance };

  beforeEach(() => {
    mockFetcher = { fetchLives: vi.fn(), fetchChannel: vi.fn() };
    mockLiveRegistrar = { register: vi.fn() };
    mockChannelFinder = { findFollowedChannels: vi.fn() };
    mockLiveFinder = { findByPid: vi.fn() };
    mockFilter = { getFiltered: vi.fn() };
    mockHistoryRepo = { exists: vi.fn(), set: vi.fn() };
    coordinator = new LiveCoordinator(
      mockChannelFinder as any,
      mockLiveFinder as any,
      mockLiveRegistrar as any,
      mockFetcher as any,
      mockFilter as any,
      mockHistoryRepo as any,
    );
  });

  describe('registerQueriedLives', () => {
    it('openLive가 true인 경우 등록', async () => {
      // Given
      const mockChannel0 = mockChzzkChannelLiveInfo({ openLive: true });
      const mockChannel1 = mockChzzkChannelLiveInfo({ openLive: false });
      const mockChannel2 = mockChzzkChannelLiveInfo({ openLive: true });

      mockChannelFinder.findFollowedChannels.mockResolvedValue([mockChannel0, mockChannel1, mockChannel2]);
      mockFetcher.fetchChannel
        .mockResolvedValueOnce(mockChannel0)
        .mockResolvedValueOnce(mockChannel0)
        .mockResolvedValueOnce(mockChannel1)
        .mockResolvedValueOnce(mockChannel2)
        .mockResolvedValueOnce(mockChannel2);

      // When
      await coordinator.registerFollowedLives();

      // Then
      expect(mockLiveRegistrar.register).toHaveBeenNthCalledWith(1, { channelInfo: mockChannel0 });
      expect(mockLiveRegistrar.register).toHaveBeenNthCalledWith(2, { channelInfo: mockChannel2 });
    });
  });

  describe('registerQueriedLives', () => {
    it('정상적인 라이브 등록 시나리오', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto({
        platform: mockPlatformDto({ name: 'chzzk' }),
        loggingOnly: false,
      });

      const mockChannel0 = mockChzzkChannelLiveInfo();
      const mockChannel1 = mockChzzkChannelLiveInfo();
      const mockChannel2 = mockChzzkChannelLiveInfo();

      const queriedLives = [mockChannel0.liveInfo, mockChannel1.liveInfo, mockChannel2.liveInfo];
      const filteredLives = [mockChannel0.liveInfo, mockChannel2.liveInfo];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockFetcher.fetchChannel.mockResolvedValueOnce(mockChannel0).mockResolvedValueOnce(mockChannel2);

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockLiveRegistrar.register).toHaveBeenNthCalledWith(1, {
        channelInfo: mockChannel0,
        criterion: mockCriterion,
      });
      expect(mockLiveRegistrar.register).toHaveBeenNthCalledWith(2, {
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

      const mockChannel0 = mockChzzkChannelLiveInfo();
      const mockChannel1 = mockChzzkChannelLiveInfo();
      const mockChannel2 = mockChzzkChannelLiveInfo();
      const mockChannel3 = mockChzzkChannelLiveInfo();

      const queriedLives = [
        mockChannel0.liveInfo,
        mockChannel1.liveInfo,
        mockChannel2.liveInfo,
        mockChannel3.liveInfo,
      ];
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
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(1, 'chzzk', mockChannel0.liveInfo);
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(2, 'chzzk', mockChannel2.liveInfo);
      expect(mockHistoryRepo.set).toHaveBeenNthCalledWith(3, 'chzzk', mockChannel3.liveInfo);
    });
  });
});
