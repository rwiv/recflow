import { TableContent } from '@/components/channel/content/TableContent.tsx';
import { useEffect } from 'react';
import { PageNavigation } from '@/components/channel/search/ChannelNavigation.tsx';
import { PrioritySelect } from '@/components/channel/search/PrioritySelect.tsx';
import { Button } from '@/components/ui/button.tsx';
import { css } from '@emotion/react';
import { KeywordSearchBar } from '@/components/channel/search/KeywordSearchBar.tsx';
import { SortSelect } from '@/components/channel/search/SortSelect.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChannelCreateButton } from '@/components/channel/edit/ChannelCreateButton.tsx';
import { DEFAULT_END_PAGE, DEFAULT_PAGINATION_SIZE } from '@/common/consts.ts';
import { fetchChannels } from '@/client/channel.client.ts';
import { ChannelPageState } from '@/hooks/ChannelPageState.ts';
import { LoadingComponent } from '@/components/common/layout/LoadingComponent.tsx';
import { TagQuerySelect } from '@/components/channel/search/TagQuerySelect.tsx';

interface ChannelTableProps {
  pageState: ChannelPageState;
}

export function ChannelTable({ pageState }: ChannelTableProps) {
  const queryClient = useQueryClient();

  const { data: channels, isLoading } = useQuery({
    queryKey: pageState.queryKeys(),
    queryFn: () => fetchChannels(pageState),
  });

  useEffect(() => {
    if (pageState.isSingle) return;
    const newPageState = pageState.calculated(1);
    queryClient.prefetchQuery({
      queryKey: newPageState.queryKeys(),
      queryFn: () => fetchChannels(newPageState),
    });
  }, [pageState, queryClient]);

  if (isLoading) {
    return <LoadingComponent />;
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
          <TagQuerySelect />
          <SortSelect />
          <Button variant="outline" css={css({ width: '5.5rem' })}>
            Refresh
          </Button>
        </div>
      </div>
      <div className="rounded-md border">{channels && <TableContent channels={channels} />}</div>
      <div className="my-7">
        <PageNavigation
          pageState={pageState}
          paginationSize={DEFAULT_PAGINATION_SIZE}
          endPage={DEFAULT_END_PAGE}
        />
      </div>
    </div>
  );
}
