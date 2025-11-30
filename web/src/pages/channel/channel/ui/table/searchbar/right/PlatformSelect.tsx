import { css } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
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
import { platformNameEnum } from '@/entities/platform/model/platform.schema.ts';

import { fetchPlatforms } from '@/features/platform/api/platform.client.ts';
import { PLATFORMS_QUERY_KEY } from '@/features/platform/config/constants.ts';

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
