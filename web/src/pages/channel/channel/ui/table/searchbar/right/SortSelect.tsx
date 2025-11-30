import { css } from '@emotion/react';
import { useNavigate } from 'react-router';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/cn/select.tsx';

import { useChannelPageStore } from '@/entities/channel/channel/model/useChannelPageStore.ts';

export function SortSelect() {
  const navigate = useNavigate();
  const { pageState } = useChannelPageStore();

  const onChange = async (value: string) => {
    if (!pageState) return;
    const newPageState = pageState.new().setSorted(value).build();
    navigate(`/channels?${newPageState.toQueryString()}`);
  };

  return (
    <Select defaultValue={pageState?.sortBy ?? 'updatedAt'} onValueChange={onChange}>
      <SelectTrigger css={css({ width: '10rem' })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="createdAt">Create Date</SelectItem>
          <SelectItem value="updatedAt">Update Date</SelectItem>
          <SelectItem value="followerCnt">Follower Count</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
