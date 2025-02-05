import { ChannelPriority, ChannelSortType } from '@/common/enum.types.ts';
import { checkType } from '@/lib/union.ts';
import { CHANNEL_PRIORITIES, CHANNEL_SORT_TYPES } from '@/common/enum.consts.ts';
import { CHANNELS_QUERY_KEY, DEFAULT_PAGE_SIZE } from '@/common/consts.ts';

export class ChannelPageState {
  curPageNum: number;
  pageSize: number;
  priority: ChannelPriority | undefined;
  tagName: string | undefined;
  sorted: ChannelSortType | undefined;

  constructor(builder: ChannelPageStateBuilder) {
    this.curPageNum = builder.curPageNum;
    this.pageSize = builder.pageSize;
    this.priority = builder.priority;
    this.tagName = builder.tagName;
    this.sorted = builder.sorted;
  }

  new() {
    return new ChannelPageStateBuilder()
      .setCurPageNum(this.curPageNum)
      .setPageSize(this.pageSize)
      .setPriority(this.priority)
      .setTagName(this.tagName)
      .setSorted(this.sorted);
  }

  calculated(calcNum: number) {
    return this.new()
      .setCurPageNum(this.curPageNum + calcNum)
      .build();
  }

  withNewPageNum(newPageNum: number) {
    return this.new().setCurPageNum(newPageNum).build();
  }

  toQueryString(): string {
    const params = new URLSearchParams();
    params.set('p', this.curPageNum.toString());
    params.set('s', this.pageSize.toString());
    if (this.priority) {
      params.set('pri', this.priority);
    }
    if (this.tagName) {
      params.set('tn', this.tagName);
    }
    if (this.sorted) {
      params.set('st', this.sorted);
    }
    return params.toString();
  }

  queryKeys() {
    return [CHANNELS_QUERY_KEY, this.curPageNum, this.priority, this.tagName, this.sorted];
  }
}

export class ChannelPageStateBuilder {
  curPageNum: number = -1;
  pageSize: number = DEFAULT_PAGE_SIZE;
  priority: ChannelPriority | undefined;
  tagName: string | undefined;
  sorted: ChannelSortType | undefined;

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

  build(): ChannelPageState {
    if (this.curPageNum === -1) {
      throw new Error('curPageNum is not set');
    }
    return new ChannelPageState(this);
  }
}

export function defaultPageState() {
  return new ChannelPageStateBuilder().setCurPageNum(1).build();
}
