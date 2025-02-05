import { TableContent } from '@/components/channel/content/TableContent.tsx';
import { useEffect } from 'react';
import { PageNavigation } from '@/components/common/layout/ChannelNavigation.tsx';
import { PrioritySelect } from '@/components/channel/search/PrioritySelect.tsx';
import { TagSelect } from '@/components/channel/common/TagSelect.tsx';
import { Button } from '@/components/ui/button.tsx';
import { css } from '@emotion/react';
import { KeywordSearchBar } from '@/components/channel/search/KeywordSearchBar.tsx';
import { SortSelect } from '@/components/channel/search/SortSelect.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChannelCreateButton } from '@/components/channel/edit/ChannelCreateButton.tsx';
import {
  CHANNELS_QUERY_KEY,
  DEFAULT_END_PAGE,
  DEFAULT_PAGINATION_SIZE,
  PREFETCH_SIZE,
} from '@/common/consts.ts';
import { ChannelRecord } from '@/client/channel.types.ts';
import { fetchChannels } from '@/client/channel.client.ts';

export interface ChannelTableProps {
  page: number;
  size: number;
}

export function ChannelTable({ page, size }: ChannelTableProps) {
  const queryClient = useQueryClient();
  const prefetched1 = queryClient.getQueryData([CHANNELS_QUERY_KEY, page + 1]) as ChannelRecord[];

  const {
    data: channels,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [CHANNELS_QUERY_KEY, page],
    queryFn: () => fetchChannels(page, size),
  });

  useEffect(() => {
    for (let i = 1; i <= PREFETCH_SIZE; i++) {
      queryClient.prefetchQuery({
        queryKey: [CHANNELS_QUERY_KEY, page + i],
        queryFn: () => fetchChannels(page + i, size),
      });
    }
  }, [page, queryClient]);

  useEffect(() => {
    // console.log(prefetched1);
  }, [prefetched1]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex">
          <KeywordSearchBar />
          <div className="flex ml-2 gap-1">
            <ChannelCreateButton />
          </div>
        </div>
        <div className="flex gap-2">
          <PrioritySelect />
          <TagSelect onSelectCallback={() => {}} />
          <SortSelect />
          <Button variant="outline" css={css({ width: '5.5rem' })}>
            Refresh
          </Button>
        </div>
      </div>
      <div className="rounded-md border">{channels && <TableContent channels={channels} />}</div>
      <div className="my-7">
        <PageNavigation curPage={page} size={DEFAULT_PAGINATION_SIZE} endPage={DEFAULT_END_PAGE} />
      </div>
    </div>
  );
}
