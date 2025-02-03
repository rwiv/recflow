import { ChannelRecord } from '@/client/types.ts';
import { Button } from '@/components/ui/button.tsx';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { IconButton } from '@/components/common/IconButton.tsx';
import { ChannelTableContent } from '@/components/table/channel/ChannelTableContent.tsx';
import { ChannelAddButton } from '@/components/table/channel/ChannelAddButton.tsx';

export function ChannelTable({ channels }: { channels: ChannelRecord[] }) {
  return (
    <div>
      <div className="rounded-md border">
        <ChannelTableContent channels={channels} />
      </div>
      <div className="flex justify-between space-x-2 py-4">
        <div className="flex flex-row space-x-2">
          <SearchBtn />
          <Separator orientation="vertical" />
          <ChannelAddButton />
        </div>
        <PageNavigation />
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

function PageNavigation() {
  return (
    <div className="space-x-2">
      <Button variant="outline">Previous</Button>
      <Button variant="outline">Next</Button>
    </div>
  );
}
