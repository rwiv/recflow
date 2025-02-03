import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { css } from '@emotion/react';

export function ChannelSortSelect() {
  return (
    <Select defaultValue="updatedAy">
      <SelectTrigger css={css({ width: '10rem' })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="updatedAy">Update Date</SelectItem>
          <SelectItem value="followerCnt">Follower Count</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
