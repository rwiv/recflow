import { DEFAULT_PAGE_SIZE } from '@/common/constants.ts';
import { ChannelPriority, ChannelSortType } from '@/common/enum.types.ts';
import { checkType } from '@/lib/union.ts';
import { CHANNEL_PRIORITIES, CHANNEL_SORT_TYPES } from '@/common/enum.consts.ts';
import { ChannelPageState } from '@/hooks/ChannelPageState.ts';

export class ChannelPageStateBuilder {
  curPageNum: number = -1;
  pageSize: number = DEFAULT_PAGE_SIZE;
  priority: ChannelPriority | undefined;
  tagName: string | undefined;
  sorted: ChannelSortType | undefined;
  pid: string | undefined;
  username: string | undefined;
  isSingle: boolean = false;

  setCurPageNum(curPageNum: number): this {
    this.curPageNum = curPageNum;
    return this;
  }

  setPageSize(pageSize: number): this {
    this.pageSize = pageSize;
    return this;
  }

  setPriority(priority: string | null | undefined): this {
    this.priority = checkType(priority, CHANNEL_PRIORITIES);
    return this;
  }

  setTagName(tagName: string | null | undefined): this {
    if (tagName === null) {
      return this;
    }
    this.tagName = tagName;
    return this;
  }

  setSorted(sorted: string | null | undefined): this {
    if (!sorted) {
      this.sorted = 'latest';
    }
    this.sorted = checkType(sorted, CHANNEL_SORT_TYPES);
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
