import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/cn/select.tsx';
import { css } from '@emotion/react';
import { useChannelPageStore } from '@entities/channel/channel/model/useChannelPageStore.ts';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchPlatforms } from '@entities/platform/api/platform.client.ts';
import { platformNameEnum, PLATFORMS_QUERY_KEY } from '@entities/platform';

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
