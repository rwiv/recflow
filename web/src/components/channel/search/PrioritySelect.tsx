import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { css } from '@emotion/react';
import { useChannelPageStore } from '@/hooks/channel/useChannelPageStore.ts';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import { fetchPriorities } from '@/client/channel/priority.client.ts';

export function PrioritySelect() {
  const navigate = useNavigate();
  const { pageState } = useChannelPageStore();

  const { data: priorities } = useQuery({
    queryKey: [PRIORITIES_QUERY_KEY],
    queryFn: fetchPriorities,
  });

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
          {priorities?.map((priority) => (
            <SelectItem key={priority.id} value={priority.name}>
              {priority.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
