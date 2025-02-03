import { ChannelRecord } from '@/client/types.ts';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { IconButton } from '@/components/common/IconButton.tsx';
import { ChannelTableContent } from '@/components/table/channel/ChannelTableContent.tsx';
import { useEffect, useState } from 'react';
import { fetchChannels } from '@/client/client.ts';
import { PageNavigation } from '@/components/common/ChannelNavigation.tsx';

export interface ChannelTableProps {
  page: number;
  size: number;
}

export function ChannelTable({ page, size }: ChannelTableProps) {
  const [channels, setChannels] = useState<ChannelRecord[]>([]);

  useEffect(() => {
    fetchChannels(page, size).then(setChannels);
  }, [page, size]);

  return (
    <div>
      <div className="flex space-x-2 py-4">
        {/*<div className="flex flex-row space-x-2">*/}
        {/*  <SearchBtn />*/}
        {/*  <Separator orientation="vertical" />*/}
        {/*  <ChannelAddButton />*/}
        {/*</div>*/}
      </div>
      <div className="rounded-md border">
        <ChannelTableContent channels={channels} />
      </div>
      <div className="my-10">
        <PageNavigation curPage={page} size={7} endPage={1000000000} />
      </div>
    </div>
  );
}

function SearchBtn() {
  return (
    <div className="flex flex-row">
      <Input className="max-w-sm mr-1.5" />
      <IconButton className="w-10">
        <Search size="1.1rem" />
      </IconButton>
    </div>
  );
}
