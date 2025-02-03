import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { css } from '@emotion/react';

export function ChannelPrioritySelect() {
  return (
    <Select defaultValue="all">
      <SelectTrigger css={css({ width: '9rem' })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">ALL</SelectItem>
          <SelectItem value="must">MUST</SelectItem>
          <SelectItem value="should">SHOULD</SelectItem>
          <SelectItem value="may">MAY</SelectItem>
          <SelectItem value="review">REVIEW</SelectItem>
          <SelectItem value="skip">SKIP</SelectItem>
          <SelectItem value="none">NONE</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
