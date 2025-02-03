import { ChannelRecord } from '@/client/types.ts';
import { ChannelTableContent } from '@/components/table/channel/ChannelTableContent.tsx';
import { useEffect, useState } from 'react';
import { fetchChannels } from '@/client/client.ts';
import { PageNavigation } from '@/components/common/ChannelNavigation.tsx';
import { ChannelPrioritySelect } from '@/components/table/channel/search/ChannelPrioritySelect.tsx';
import { ChannelTagSelect } from '@/components/table/channel/search/ChannelTagSelect.tsx';
import { Button } from '@/components/ui/button.tsx';
import { css } from '@emotion/react';
import { ChannelKeywordSearchBar } from '@/components/table/channel/search/ChannelKeywordSearchBar.tsx';
import { ChannelSortSelect } from '@/components/table/channel/search/ChannelSortSelect.tsx';

export interface ChannelTableProps {
  page: number;
  size: number;
}

const DEFAULT_PAGINATION_SIZE = 7;
const DEFAULT_END_PAGE = 1000000000;

export function ChannelTable({ page, size }: ChannelTableProps) {
  const [channels, setChannels] = useState<ChannelRecord[]>([]);

  useEffect(() => {
    fetchChannels(page, size).then(setChannels);
  }, [page, size]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex">
          <ChannelKeywordSearchBar />
          <div className="flex ml-2 gap-1">
            <Button variant="secondary" className="ml-1" css={css({ width: '5.5rem' })}>
              Create
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <ChannelPrioritySelect />
          <ChannelTagSelect />
          <ChannelSortSelect />
          <Button variant="outline" css={css({ width: '5.5rem' })}>
            Refresh
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <ChannelTableContent channels={channels} />
      </div>
      <div className="my-7">
        <PageNavigation curPage={page} size={DEFAULT_PAGINATION_SIZE} endPage={DEFAULT_END_PAGE} />
      </div>
    </div>
  );
}
