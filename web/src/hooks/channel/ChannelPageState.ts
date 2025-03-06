import { CHANNELS_QUERY_KEY } from '@/common/constants.ts';
import { ChannelPageStateBuilder } from '@/hooks/channel/ChannelPageStateBuilder.ts';
import {ChannelSortType} from "@/client/common/common.schema.ts";

export class ChannelPageState {
  curPageNum: number;
  pageSize: number;
  priority: string | undefined;
  tagName: string | undefined;
  sortBy: ChannelSortType = 'updatedAt';
  pid: string | undefined;
  username: string | undefined;
  isSingle: boolean = false;

  constructor(builder: ChannelPageStateBuilder) {
    this.curPageNum = builder.curPageNum;
    this.pageSize = builder.pageSize;
    this.priority = builder.priority;
    this.tagName = builder.tagName;
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
      .setTagName(this.tagName)
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
    if (this.tagName) {
      params.set('tn', this.tagName);
    }
    if (this.sortBy) {
      params.set('st', this.sortBy);
    }
    return params.toString();
  }

  queryKeys() {
    return [
      CHANNELS_QUERY_KEY,
      this.curPageNum,
      this.priority,
      this.tagName,
      this.sortBy,
      this.pid,
      this.username,
      this.isSingle,
    ];
  }
}
