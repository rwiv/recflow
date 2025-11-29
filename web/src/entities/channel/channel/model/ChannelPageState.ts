import { CHANNELS_QUERY_KEY } from '@shared/config/constants.ts';
import { PlatformName } from '@entities/platform/api/platform.schema.ts';
import { ChannelPageStateBuilder } from './ChannelPageStateBuilder.ts';
import { ChannelSortType } from './channel_query.schema.ts';

export class ChannelPageState {
  curPageNum: number;
  pageSize: number;
  grade: string | undefined;
  platform: PlatformName | undefined;
  includeTags: string[];
  excludeTags: string[];
  sortBy: ChannelSortType = 'updatedAt';
  sourceId: string | undefined;
  username: string | undefined;
  isSingle: boolean = false;

  constructor(builder: ChannelPageStateBuilder) {
    this.curPageNum = builder.curPageNum;
    this.pageSize = builder.pageSize;
    this.grade = builder.grade;
    this.platform = builder.platform;
    this.includeTags = builder.includeTags;
    this.excludeTags = builder.excludeTags;
    this.sortBy = builder.sortBy;
    this.sourceId = builder.sourceId;
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
      .setGrade(this.grade)
      .setPlatform(this.platform)
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
      if (this.sourceId) {
        params.set('uid', this.sourceId);
      }
      if (this.username) {
        params.set('uname', this.username);
      }
      return params.toString();
    }

    params.set('p', this.curPageNum.toString());
    params.set('s', this.pageSize.toString());
    if (this.grade) {
      params.set('gr', this.grade);
    }
    if (this.platform) {
      params.set('pf', this.platform);
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
      this.grade,
      this.platform,
      this.includeTags.join(','),
      this.excludeTags.join(','),
      this.sortBy,
      this.sourceId,
      this.username,
      this.isSingle,
    ];
  }
}
