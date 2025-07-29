import { DEFAULT_CHANNEL_PAGE_SIZE } from '@/common/constants.ts';
import { ChannelPageState } from '@/hooks/channel/ChannelPageState.ts';
import { ChannelSortType, channelSortTypeEnum } from '@/client/common/common.schema.ts';

export class ChannelPageStateBuilder {
  curPageNum: number = -1;
  pageSize: number = DEFAULT_CHANNEL_PAGE_SIZE;
  priority: string | undefined;
  includeTags: string[] = [];
  excludeTags: string[] = [];
  sortBy: ChannelSortType = 'updatedAt';
  pid: string | undefined;
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

  setPriority(priority: string | null | undefined): this {
    if (priority !== null) {
      this.priority = priority;
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

  setPid(pid: string | null | undefined): this {
    if (pid === null) {
      return this;
    }
    if (pid) {
      this.pid = pid;
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
