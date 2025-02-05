import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { css } from '@emotion/react';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { useNavigate } from 'react-router';

export function PrioritySelect() {
  const navigate = useNavigate();
  const { pageState } = useChannelPageStore();

  const onChange = async (value: string) => {
    if (!pageState) return;
    const builder = pageState.new();
    if (value === 'all') {
      builder.setPriority(undefined);
    } else {
      builder.setPriority(value);
    }
    navigate(`/channels?${builder.build().toQueryString()}`);
  };

  if (!pageState) {
    return <div>Loading...</div>;
  }

  return (
    <Select defaultValue={pageState.priority ?? 'all'} onValueChange={onChange}>
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
