import { ChannelCreateButton } from '@/pages/channel/channel/ui/table/searchbar/left/createButton/ChannelCreateButton.tsx';
import { KeywordSearchBar } from '@/pages/channel/channel/ui/table/searchbar/left/KeywordSearchBar.tsx';

export function LeftSearchBar() {
  return (
    <div className="flex">
      <KeywordSearchBar />
      <div className="flex ml-2 gap-1">
        <ChannelCreateButton />
      </div>
    </div>
  );
}
