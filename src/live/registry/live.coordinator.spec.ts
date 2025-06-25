import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { mockPlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.mocks.js';
import { mockLiveInfoChzzk } from '../../platform/spec/wapper/live.mocks.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
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
    it('정상적인 라이브 등록 시나리오를 테스트한다', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto();
      const mockLive1 = mockLiveInfoChzzk({ channelId: 'pid1', liveId: 1 });
      const mockLive2 = mockLiveInfoChzzk({ channelId: 'pid2', liveId: 2 });
      const queriedLives = [mockLive1, mockLive2];
      const filteredLives = [mockLive1];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockLiveFinder.findByPid.mockResolvedValue(null);
      mockFetcher.fetchChannel
        .mockResolvedValueOnce({ openLive: true })
        .mockResolvedValueOnce({ liveInfo: { liveId: 'test-live-id' } });

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockFetcher.fetchLives).toHaveBeenCalledWith(mockCriterion);
      expect(mockFilter.getFiltered).toHaveBeenCalledWith(mockCriterion, queriedLives);
      expect(mockLiveFinder.findByPid).toHaveBeenCalledWith(mockLive1.pid, expect.anything());
      expect(mockFetcher.fetchChannel).toHaveBeenCalledWith(mockLive1.type, mockLive1.pid, true);
      expect(mockLiveRegistrar.register).toHaveBeenCalledWith({
        channelInfo: expect.any(Object),
        criterion: mockCriterion,
      });
    });

    it('loggingOnly가 true일 때 히스토리에만 저장한다', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto({ loggingOnly: true });
      const mockLive1 = mockLiveInfoChzzk({ channelId: 'pid1', liveId: 1 });
      const queriedLives = [mockLive1];
      const filteredLives = [mockLive1];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockHistoryRepo.exists.mockResolvedValue(false);

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockHistoryRepo.exists).toHaveBeenCalledWith(mockCriterion.platform.name, mockLive1.liveId);
      expect(mockHistoryRepo.set).toHaveBeenCalledWith(mockCriterion.platform.name, mockLive1);
      expect(mockLiveRegistrar.register).not.toHaveBeenCalled();
    });

    it('loggingOnly가 true이고 이미 히스토리에 존재하는 경우 건너뛴다', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto({ loggingOnly: true });
      const mockLive1 = mockLiveInfoChzzk({ channelId: 'pid1', liveId: 1 });
      const queriedLives = [mockLive1];
      const filteredLives = [mockLive1];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockHistoryRepo.exists.mockResolvedValue(true);

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockHistoryRepo.exists).toHaveBeenCalledWith(mockCriterion.platform.name, mockLive1.liveId);
      expect(mockHistoryRepo.set).not.toHaveBeenCalled();
      expect(mockLiveRegistrar.register).not.toHaveBeenCalled();
    });

    it('이미 존재하는 라이브는 건너뛴다', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto();
      const mockLive1 = mockLiveInfoChzzk({ channelId: 'pid1', liveId: 1 });
      const queriedLives = [mockLive1];
      const filteredLives = [mockLive1];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockLiveFinder.findByPid.mockResolvedValue({ id: 'existing-live' } as any);

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockLiveFinder.findByPid).toHaveBeenCalledWith(mockLive1.pid, expect.anything());
      expect(mockFetcher.fetchChannel).not.toHaveBeenCalled();
      expect(mockLiveRegistrar.register).not.toHaveBeenCalled();
    });

    it('채널 정보를 가져올 수 없는 경우 건너뛴다', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto();
      const mockLive1 = mockLiveInfoChzzk({ channelId: 'pid1', liveId: 1 });
      const queriedLives = [mockLive1];
      const filteredLives = [mockLive1];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockLiveFinder.findByPid.mockResolvedValue(null);
      mockFetcher.fetchChannel.mockResolvedValue(null);

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockFetcher.fetchChannel).toHaveBeenCalledWith(mockLive1.type, mockLive1.pid, true);
      expect(mockLiveRegistrar.register).not.toHaveBeenCalled();
    });

    it('라이브 정보가 없는 채널은 건너뛴다', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto();
      const mockLive1 = mockLiveInfoChzzk({ channelId: 'pid1', liveId: 1 });
      const queriedLives = [mockLive1];
      const filteredLives = [mockLive1];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);
      mockLiveFinder.findByPid.mockResolvedValue(null);
      mockFetcher.fetchChannel.mockResolvedValue({ liveInfo: null });

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockFetcher.fetchChannel).toHaveBeenCalledWith(mockLive1.type, mockLive1.pid, true);
      expect(mockLiveRegistrar.register).not.toHaveBeenCalled();
    });

    it('여러 라이브를 처리할 때 일부가 실패해도 나머지는 계속 처리한다', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto();
      const mockLive1 = mockLiveInfoChzzk({ channelId: 'pid1', liveId: 1 });
      const mockLive2 = mockLiveInfoChzzk({ channelId: 'pid2', liveId: 2 });
      const queriedLives = [mockLive1, mockLive2];
      const filteredLives = [mockLive1, mockLive2];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);

      // 첫 번째 라이브는 실패
      mockLiveFinder.findByPid
        .mockResolvedValueOnce({ id: 'existing-live' } as any)
        .mockResolvedValueOnce(null);

      // 두 번째 라이브는 성공
      mockFetcher.fetchChannel
        .mockResolvedValueOnce({ openLive: true })
        .mockResolvedValueOnce({ liveInfo: { liveId: 'test-live-id' } });

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockLiveFinder.findByPid).toHaveBeenCalledTimes(2);
      expect(mockFetcher.fetchChannel).toHaveBeenCalledTimes(2);
      expect(mockLiveRegistrar.register).toHaveBeenCalledTimes(1);
    });

    it('빈 필터링 결과에 대해 아무것도 처리하지 않는다', async () => {
      // Given
      const mockCriterion = mockPlatformCriterionDto();
      const mockLive1 = mockLiveInfoChzzk({ channelId: 'pid1', liveId: 1 });
      const mockLive2 = mockLiveInfoChzzk({ channelId: 'pid2', liveId: 2 });
      const queriedLives = [mockLive1, mockLive2];
      const filteredLives: LiveInfo[] = [];

      mockFetcher.fetchLives.mockResolvedValue(queriedLives);
      mockFilter.getFiltered.mockResolvedValue(filteredLives);

      // When
      await coordinator.registerQueriedLives(mockCriterion);

      // Then
      expect(mockFetcher.fetchLives).toHaveBeenCalledWith(mockCriterion);
      expect(mockFilter.getFiltered).toHaveBeenCalledWith(mockCriterion, queriedLives);
      expect(mockLiveFinder.findByPid).not.toHaveBeenCalled();
      expect(mockFetcher.fetchChannel).not.toHaveBeenCalled();
      expect(mockLiveRegistrar.register).not.toHaveBeenCalled();
    });
  });
});
