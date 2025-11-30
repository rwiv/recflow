import { LeftSearchBar } from '@/pages/channel/channel/ui/table/searchbar/left/LeftSearchBar.tsx';
import { RightSearchBar } from '@/pages/channel/channel/ui/table/searchbar/right/RightSearchBar.tsx';

export function ChannelSearchBar() {
  return (
    <div className="flex items-center justify-between mb-4">
      <LeftSearchBar />
      <RightSearchBar />
    </div>
  );
}
