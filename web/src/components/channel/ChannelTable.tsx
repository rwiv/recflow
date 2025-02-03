import { ChannelRecord } from '@/client/types.ts';
import { ChannelTableContent } from '@/components/channel/ChannelTableContent.tsx';
import { useEffect } from 'react';
import { fetchChannels } from '@/client/client.ts';
import { PageNavigation } from '@/components/common/ui/ChannelNavigation.tsx';
import { PrioritySelect } from '@/components/channel/search/PrioritySelect.tsx';
import { TagSelect } from '@/components/channel/search/TagSelect.tsx';
import { Button } from '@/components/ui/button.tsx';
import { css } from '@emotion/react';
import { KeywordSearchBar } from '@/components/channel/search/KeywordSearchBar.tsx';
import { SortSelect } from '@/components/channel/search/SortSelect.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateButton } from '@/components/channel/edit/CreateButton.tsx';

export interface ChannelTableProps {
  page: number;
  size: number;
}

const DEFAULT_PAGINATION_SIZE = 7;
const DEFAULT_END_PAGE = 1000000000;
const QUERY_KEY = 'channels';
const PREFETCH_SIZE = 2;

export function ChannelTable({ page, size }: ChannelTableProps) {
  const queryClient = useQueryClient();
  const prefetched1 = queryClient.getQueryData([QUERY_KEY, page + 1]) as ChannelRecord[];

  const {
    data: channels,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEY, page],
    queryFn: () => fetchChannels(page, size),
  });

  useEffect(() => {
    for (let i = 1; i <= PREFETCH_SIZE; i++) {
      queryClient.prefetchQuery({
        queryKey: [QUERY_KEY, page + i],
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
            <CreateButton />
          </div>
        </div>
        <div className="flex gap-2">
          <PrioritySelect />
          <TagSelect />
          <SortSelect />
          <Button variant="outline" css={css({ width: '5.5rem' })}>
            Refresh
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        {channels && <ChannelTableContent channels={channels} />}
      </div>
      <div className="my-7">
        <PageNavigation curPage={page} size={DEFAULT_PAGINATION_SIZE} endPage={DEFAULT_END_PAGE} />
      </div>
    </div>
  );
}
