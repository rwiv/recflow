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
import { PLATFORMS_QUERY_KEY } from '@/common/constants.ts';
import { fetchPlatforms } from '@/client/common/platform.client.ts';
import { platformNameEnum } from '@/client/common/platform.schema.ts';

export function PlatformSelect() {
  const navigate = useNavigate();
  const { pageState } = useChannelPageStore();

  const { data: platforms } = useQuery({
    queryKey: [PLATFORMS_QUERY_KEY],
    queryFn: fetchPlatforms,
  });

  const onChange = async (value: string) => {
    if (!pageState) return;
    const builder = pageState.new();
    if (value === 'all') {
      builder.setPlatform(undefined);
    } else {
      builder.setPlatform(platformNameEnum.parse(value));
    }
    navigate(`/channels?${builder.build().toQueryString()}`);
  };

  if (!pageState) {
    return <div>Loading...</div>;
  }

  return (
    <Select defaultValue={pageState.platform ?? 'all'} onValueChange={onChange}>
      <SelectTrigger css={css({ width: '9rem' })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">All Platform</SelectItem>
          {platforms?.map((platform) => (
            <SelectItem key={platform.id} value={platform.name}>
              {platform.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
