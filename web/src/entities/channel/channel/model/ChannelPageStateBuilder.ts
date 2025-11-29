import { PlatformName } from '@entities/platform/api/platform.schema.ts';
import { DEFAULT_CHANNEL_PAGE_SIZE } from '@entities/channel/channel/config/constants.ts';
import {
  ChannelSortType,
  channelSortTypeEnum,
} from '@entities/channel/channel/model/channel_query.schema.ts';
import { ChannelPageState } from '@entities/channel/channel/model/ChannelPageState.ts';

export class ChannelPageStateBuilder {
  curPageNum: number = -1;
  pageSize: number = DEFAULT_CHANNEL_PAGE_SIZE;
  grade: string | undefined;
  platform: PlatformName | undefined;
  includeTags: string[] = [];
  excludeTags: string[] = [];
  sortBy: ChannelSortType = 'updatedAt';
  sourceId: string | undefined;
  username: string | undefined;
  isSingle: boolean = false;

  setIncludeTags(tags: string[]): this {
    this.includeTags = tags;
    return this;
  }

  setExcludeTags(tags: string[]): this {
    this.excludeTags = tags;
    return this;
  }

  setCurPageNum(curPageNum: number): this {
    this.curPageNum = curPageNum;
    return this;
  }

  setPageSize(pageSize: number): this {
    this.pageSize = pageSize;
    return this;
  }

  setGrade(grade: string | null | undefined): this {
    if (grade !== null) {
      this.grade = grade;
    }
    return this;
  }

  setPlatform(platform: PlatformName | null | undefined): this {
    if (platform !== null) {
      this.platform = platform;
    }
    return this;
  }

  setSorted(sorted: string | null | undefined): this {
    if (!sorted) {
      this.sortBy = 'updatedAt';
    } else {
      this.sortBy = channelSortTypeEnum.parse(sorted);
    }
    return this;
  }

  setSourceId(sourceId: string | null | undefined): this {
    if (sourceId === null) {
      return this;
    }
    if (sourceId) {
      this.sourceId = sourceId;
      this.isSingle = true;
    }
    return this;
  }

  setUsername(username: string | null | undefined): this {
    if (username === null) {
      return this;
    }
    if (username) {
      this.username = username;
      this.isSingle = true;
    }
    return this;
  }

  build(): ChannelPageState {
    if (this.curPageNum === -1) {
      throw new Error('curPageNum is not set');
    }
    return new ChannelPageState(this);
  }
}
