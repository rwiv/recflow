import { ChannelPriority, ChannelSortType } from '@/common/enum.types.ts';
import { CHANNELS_QUERY_KEY } from '@/common/consts.ts';
import { ChannelPageStateBuilder } from '@/hooks/ChannelPageStateBuilder.ts';

export class ChannelPageState {
  curPageNum: number;
  pageSize: number;
  priority: ChannelPriority | undefined;
  tagName: string | undefined;
  sorted: ChannelSortType | undefined;
  pid: string | undefined;
  username: string | undefined;
  isSingle: boolean = false;

  constructor(builder: ChannelPageStateBuilder) {
    this.curPageNum = builder.curPageNum;
    this.pageSize = builder.pageSize;
    this.priority = builder.priority;
    this.tagName = builder.tagName;
    this.sorted = builder.sorted;
    this.pid = builder.pid;
    this.username = builder.username;
    this.isSingle = builder.isSingle;
  }

  static default() {
    return new ChannelPageStateBuilder().setCurPageNum(1).setSorted('latest').build();
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
    if (this.isSingle) {
      if (this.pid) {
        params.set('pid', this.pid);
      }
      if (this.username) {
        params.set('uname', this.username);
      }
      return params.toString();
    }

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
    return [
      CHANNELS_QUERY_KEY,
      this.curPageNum,
      this.priority,
      this.tagName,
      this.sorted,
      this.pid,
      this.username,
      this.isSingle,
    ];
  }
}
