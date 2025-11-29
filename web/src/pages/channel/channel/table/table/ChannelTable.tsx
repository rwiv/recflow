import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_CHANNEL_PAGINATION_SIZE } from '@shared/config/constants.ts';
import { ChannelPageState } from '@entities/channel/channel/model/ChannelPageState.ts';
import { fetchChannels } from '@entities/channel/channel/api/channel.client.ts';
import { LoadingComponent } from '@shared/ui/misc';
import { ChannelTableContent } from './ChannelTableContent.tsx';
import { ChannelPageNavigation } from './ChannelPageNavigation.tsx';
import { ChannelSearchBar } from '../searchbar';

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
