import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { LoadingComponent } from '@/shared/ui/misc/LoadingComponent.tsx';

import { ChannelPageState } from '@/entities/channel/channel/model/ChannelPageState.ts';

import { fetchChannels } from '@/pages/channel/channel/api/channel.client.ts';
import { DEFAULT_CHANNEL_PAGINATION_SIZE } from '@/pages/channel/channel/config/constants.ts';
import { ChannelSearchBar } from '@/pages/channel/channel/ui/table/searchbar/ChannelSearchBar.tsx';
import { ChannelPageNavigation } from '@/pages/channel/channel/ui/table/table/ChannelPageNavigation.tsx';
import { ChannelTableContent } from '@/pages/channel/channel/ui/table/table/ChannelTableContent.tsx';

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
      <ChannelPageNavigation
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
      <ChannelSearchBar />
      <div className="rounded-md border">
        {pageResult?.channels && <ChannelTableContent channels={pageResult.channels} />}
      </div>
      <div className="my-7">{pagination()}</div>
    </div>
  );
}
