import { ChannelTableContent } from '@/components/channel/content/ChannelTableContent.tsx';
import { useEffect } from 'react';
import { PageNavigation } from '@/components/channel/search/ChannelNavigation.tsx';
import { GradeSelect } from '@/components/channel/search/GradeSelect.tsx';
import { KeywordSearchBar } from '@/components/channel/search/KeywordSearchBar.tsx';
import { SortSelect } from '@/components/channel/search/SortSelect.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChannelCreateButton } from '@/components/channel/edit/ChannelCreateButton.tsx';
import { DEFAULT_CHANNEL_PAGINATION_SIZE } from '@/common/constants.ts';
import { fetchChannels } from '@/client/channel/channel.client.ts';
import { ChannelPageState } from '@/hooks/channel/ChannelPageState.ts';
import { LoadingComponent } from '@/components/common/layout/LoadingComponent.tsx';
import { TagQuerySelect } from '@/components/channel/search/TagQuerySelect.tsx';
import { PlatformSelect } from './search/PlatformSelect';

interface ChannelTableProps {
  pageState: ChannelPageState;
}

export function ChannelTable({ pageState }: ChannelTableProps) {
  const queryClient = useQueryClient();

  const { data: pageResult, isLoading } = useQuery({
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

  const pagination = () => {
    const total = pageResult?.total;
    if (!total || total < 1) return;
    return (
      <PageNavigation
        pageState={pageState}
        paginationSize={DEFAULT_CHANNEL_PAGINATION_SIZE}
        endPage={Math.ceil(total / pageState.pageSize)}
      />
    );
  };

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
          <GradeSelect />
          <PlatformSelect />
          <TagQuerySelect type="include" />
          <TagQuerySelect type="exclude" />
          <SortSelect />
        </div>
      </div>
      <div className="rounded-md border">
        {pageResult?.channels && <ChannelTableContent channels={pageResult.channels} />}
      </div>
      <div className="my-7">{pagination()}</div>
    </div>
  );
}
