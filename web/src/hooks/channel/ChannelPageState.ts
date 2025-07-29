import { CHANNELS_QUERY_KEY } from '@/common/constants.ts';
import { ChannelPageStateBuilder } from '@/hooks/channel/ChannelPageStateBuilder.ts';
import { ChannelSortType } from '@/client/common/common.schema.ts';

export class ChannelPageState {
  curPageNum: number;
  pageSize: number;
  priority: string | undefined;
  includeTags: string[];
  excludeTags: string[];
  sortBy: ChannelSortType = 'updatedAt';
  pid: string | undefined;
  username: string | undefined;
  isSingle: boolean = false;

  constructor(builder: ChannelPageStateBuilder) {
    this.curPageNum = builder.curPageNum;
    this.pageSize = builder.pageSize;
    this.priority = builder.priority;
    this.includeTags = builder.includeTags;
    this.excludeTags = builder.excludeTags;
    this.sortBy = builder.sortBy;
    this.pid = builder.pid;
    this.username = builder.username;
    this.isSingle = builder.isSingle;
  }

  static default() {
    return new ChannelPageStateBuilder().setCurPageNum(1).build();
  }

  new() {
    return new ChannelPageStateBuilder()
      .setCurPageNum(this.curPageNum)
      .setPageSize(this.pageSize)
      .setPriority(this.priority)
      .setIncludeTags(this.includeTags)
      .setExcludeTags(this.excludeTags)
      .setSorted(this.sortBy);
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
    if (this.includeTags.length > 0) {
      params.set('it', this.includeTags.join(','));
    }
    if (this.excludeTags.length > 0) {
      params.set('et', this.excludeTags.join(','));
    }
    if (this.sortBy) {
      params.set('st', this.sortBy);
    }
    return params.toString();
  }

  queryKeys(): (string | number | boolean | undefined)[] {
    return [
      CHANNELS_QUERY_KEY,
      this.curPageNum,
      this.priority,
      this.includeTags.join(','),
      this.excludeTags.join(','),
      this.sortBy,
      this.pid,
      this.username,
      this.isSingle,
    ];
  }
}
